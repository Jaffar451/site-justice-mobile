import React, { useState, useMemo } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator, RefreshControl,
  StatusBar, Platform, Modal, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ✅ Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider";
import { AdminScreenProps } from "../../types/navigation";

// ✅ Services
import { getAllCourts, deleteCourt, updateCourt, createCourt } from "../../services/court.service";

// ✅ Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const NIGER_DISTRICTS = ["Niamey", "Agadez", "Diffa", "Dosso", "Maradi", "Tahoua", "Tillabéri", "Zinder"];

const COURT_TYPES = [
  { id: 'TGI', label: 'TGI', icon: 'hammer-outline' },
  { id: 'TI', label: 'Instance', icon: 'home-outline' },
  { id: 'CA', label: 'Appel', icon: 'business-outline' },
  { id: 'SPECIAL', label: 'Pôle Spécial', icon: 'shield-checkmark-outline' },
  { id: 'CS', label: 'Cour Suprême', icon: 'library-outline' },
];

export default function AdminCourtsScreen({ navigation }: AdminScreenProps<'AdminCourts'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  // États
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "TGI",
    city: "",
    jurisdiction: "Niamey",
    address: ""
  });

  // 🎨 Palette dynamique
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
  };

  // 1️⃣ DATA
  const { data: rawCourts, isLoading, refetch } = useQuery({
    queryKey: ["courts"],
    queryFn: getAllCourts,
  });

  // 2️⃣ MUTATIONS
  const saveMutation = useMutation({
    mutationFn: (data: any) => editingId ? updateCourt(editingId, data) : createCourt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      closeModal();
      Alert.alert("Succès", "Données judiciaires synchronisées.");
    },
    onError: () => Alert.alert("Erreur", "Vérifiez la connexion au serveur.")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      Alert.alert("Succès", "Unité révoquée.");
    }
  });

  // 3️⃣ ACTIONS
  const openEdit = (court: any) => {
    setEditingId(court.id);
    setFormData({
      name: court.name,
      type: court.type,
      city: court.city,
      jurisdiction: court.jurisdiction || "Niamey",
      address: court.address || ""
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setFormData({ name: "", type: "TGI", city: "", jurisdiction: "Niamey", address: "" });
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Sécurité", `Supprimer définitivement ${name} ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", style: "destructive", onPress: () => deleteMutation.mutate(id) }
    ]);
  };

  const filteredCourts = useMemo(() => {
    const list = Array.isArray(rawCourts) ? rawCourts : [];
    return list.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rawCourts, searchQuery]);

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Juridictions" showBack />

      <View style={[styles.container, { backgroundColor: colors.bgMain }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSub} />
          <TextInput 
            placeholder="Nom du tribunal..."
            placeholderTextColor={colors.textSub}
            style={[styles.searchInput, { color: colors.textMain }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredCourts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                onPress={() => openEdit(item)}
              >
                <View style={[styles.iconBox, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons 
                    name={COURT_TYPES.find(t => t.id === item.type)?.icon as any || 'business'} 
                    size={22} 
                    color={primaryColor} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.courtName, { color: colors.textMain }]}>{item.name}</Text>
                  <Text style={[styles.courtSub, { color: colors.textSub }]}>{item.city} • {item.jurisdiction}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
          />
        )}
      </View>

      {/* ➕ MODALE D'ÉDITION REFAITE SANS PICKER */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                {editingId ? "Détails de la Juridiction" : "Enrôlement Juridiction"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={32} color={colors.textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.textSub }]}>DESIGNATION OFFICIELLE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} 
                value={formData.name}
                onChangeText={(v) => setFormData({...formData, name: v})}
              />

              <Text style={[styles.label, { color: colors.textSub }]}>TYPE D'ÉTABLISSEMENT</Text>
              <View style={styles.chipGrid}>
                {COURT_TYPES.map((t) => {
                  const isSelected = formData.type === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setFormData({ ...formData, type: t.id })}
                      style={[styles.chip, { 
                        backgroundColor: isSelected ? primaryColor : colors.inputBg,
                        borderColor: isSelected ? primaryColor : colors.border,
                        width: '31%' // 3 par ligne
                      }]}
                    >
                      <Ionicons name={t.icon as any} size={14} color={isSelected ? "#FFF" : colors.textSub} />
                      <Text style={[styles.chipText, { color: isSelected ? "#FFF" : colors.textMain }]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: colors.textSub }]}>VILLE / COMMUNE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} 
                value={formData.city}
                onChangeText={(v) => setFormData({...formData, city: v})}
              />

              <Text style={[styles.label, { color: colors.textSub }]}>RESSORT RÉGIONAL (DISTRICT)</Text>
              <View style={styles.chipGrid}>
                {NIGER_DISTRICTS.map((d) => {
                  const isSelected = formData.jurisdiction === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setFormData({ ...formData, jurisdiction: d })}
                      style={[styles.chip, { 
                        backgroundColor: isSelected ? primaryColor : colors.inputBg,
                        borderColor: isSelected ? primaryColor : colors.border,
                        width: '48%' // 2 par ligne
                      }]}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? "#FFF" : colors.textMain }]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: primaryColor }]}
                onPress={() => saveMutation.mutate(formData)}
              >
                {saveMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>VALIDER LES MODIFICATIONS</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={[styles.fab, { backgroundColor: primaryColor }]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 120 },
  card: { flexDirection: 'row', padding: 18, borderRadius: 24, marginBottom: 12, alignItems: 'center', borderWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  courtName: { fontSize: 15, fontWeight: '800' },
  courtSub: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  deleteBtn: { padding: 10, borderRadius: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 10 },
  input: { padding: 16, borderRadius: 15, marginBottom: 20, fontSize: 15, borderWidth: 1, fontWeight: '600' },
  
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  chipText: { fontSize: 13, fontWeight: '800' },
  
  saveBtn: { padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 20, elevation: 5 },
  saveText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 10 }
});