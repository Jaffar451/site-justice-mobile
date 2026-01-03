import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Architecture & Thème
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { ClerkScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

interface Witness {
  id: string;
  name: string;
  role: "ACCUSATION" | "DEFENSE" | "NEUTRAL";
  contact: string;
  isPresent: boolean;
  isSummoned: boolean;
}

export default function ClerkWitnessScreen() {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const { user } = useAuthStore();
  const route = useRoute<any>();
  const { caseId } = route.params || { caseId: "N/A" };

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    alertBg: isDark ? "#164E63" : "#F0F9FF",
  };

  const [witnesses, setWitnesses] = useState<Witness[]>([
    { id: "1", name: "Ibrahim Salifou", role: "ACCUSATION", contact: "96 00 00 01", isPresent: false, isSummoned: true },
    { id: "2", name: "Dr. Amina Moussa", role: "NEUTRAL", contact: "Expertise Balistique", isPresent: true, isSummoned: true },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newRole, setNewRole] = useState<Witness["role"]>("DEFENSE");

  const handleAddWitness = () => {
    if (!newName.trim()) {
      Alert.alert("Champs requis", "Le nom complet du témoin est obligatoire.");
      return;
    }

    const newWitness: Witness = {
      id: Date.now().toString(),
      name: newName.trim(),
      contact: newContact.trim() || "Non renseigné",
      role: newRole,
      isPresent: false,
      isSummoned: false,
    };

    setWitnesses([newWitness, ...witnesses]);
    setModalVisible(false);
    resetForm();
    if (Platform.OS === 'web') window.alert("✅ Témoin inscrit au registre des débats.");
  };

  const resetForm = () => {
    setNewName("");
    setNewContact("");
    setNewRole("DEFENSE");
  };

  const handleSummon = (id: string) => {
    const title = "Citation à comparaître";
    const msg = "Générer l'acte de citation officiel pour transmission par huissier ?";

    const execute = () => {
        setWitnesses(prev => prev.map(w => w.id === id ? { ...w, isSummoned: true } : w));
        if (Platform.OS === 'web') window.alert("Acte généré numériquement.");
    };

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) execute();
    } else {
        Alert.alert(title, msg, [{ text: "Annuler", style: "cancel" }, { text: "Générer", onPress: execute }]);
    }
  };

  const togglePresence = (id: string) => {
    setWitnesses(prev => prev.map(w => w.id === id ? { ...w, isPresent: !w.isPresent } : w));
  };

  const getRoleConfig = (role: string) => {
    switch(role) {
      case "ACCUSATION": return { color: "#EF4444", label: "À CHARGE", icon: "remove-circle-outline", bg: isDark ? "#450A0A" : "#FEE2E2" };
      case "DEFENSE": return { color: "#3B82F6", label: "À DÉCHARGE", icon: "add-circle-outline", bg: isDark ? "#172554" : "#EFF6FF" };
      default: return { color: "#8B5CF6", label: "EXPERT / NEUTRE", icon: "help-circle-outline", bg: isDark ? "#2E1065" : "#F5F3FF" };
    }
  };

  const renderItem = ({ item }: { item: Witness }) => {
    const config = getRoleConfig(item.role);
    return (
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderLeftColor: config.color, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.textMain }]}>{item.name}</Text>
            <View style={styles.roleRow}>
                <Ionicons name={config.icon as any} size={14} color={config.color} />
                <Text style={[styles.roleLabel, { color: config.color }]}>{config.label}</Text>
                <Text style={[styles.contactText, { color: colors.textSub }]}>• {item.contact}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.isPresent ? (isDark ? "#064E3B" : "#DCFCE7") : (isDark ? "#450A0A" : "#FEE2E2") }]}>
            <Text style={{ color: item.isPresent ? "#10B981" : "#EF4444", fontSize: 9, fontWeight: "900" }}>
              {item.isPresent ? "PRÉSENT" : "ABSENT"}
            </Text>
          </View>
        </View>

        <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
          <View style={styles.actionRow}>
            <Text style={[styles.actionLabel, { color: colors.textSub }]}>APPEL :</Text>
            <Switch 
              value={item.isPresent} 
              onValueChange={() => togglePresence(item.id)}
              trackColor={{ false: isDark ? "#334155" : "#CBD5E1", true: "#10B981" }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity 
            activeOpacity={0.7}
            style={[
              styles.summonBtn, 
              { backgroundColor: item.isSummoned ? (isDark ? "#334155" : "#F1F5F9") : primaryColor }
            ]}
            onPress={() => handleSummon(item.id)}
            disabled={item.isSummoned}
          >
            <Ionicons 
              name={item.isSummoned ? "checkmark-circle-outline" : "paper-plane-outline"} 
              size={14} 
              color={item.isSummoned ? colors.textSub : "#FFF"} 
            />
            <Text style={[styles.summonText, { color: item.isSummoned ? colors.textSub : "#FFF" }]}>
              {item.isSummoned ? "CITÉ" : "CITER"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Témoins RG #${caseId}`} showBack />
      
      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        <FlatList
          data={witnesses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.headerAlert, { backgroundColor: colors.alertBg }]}>
              <Ionicons name="information-circle-outline" size={20} color={primaryColor} />
              <Text style={[styles.headerAlertText, { color: isDark ? "#BAE6FD" : "#0369A1" }]}>
                Réalisez l'appel des témoins avant l'ouverture des débats.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
                <Ionicons name="people-outline" size={60} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun témoin inscrit au dossier.</Text>
            </View>
          }
        />

        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.fab, { backgroundColor: primaryColor }]} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* --- MODAL D'ENREGISTREMENT --- */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>Inscrire un Témoin</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color={colors.textSub} />
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.formLabel, { color: colors.textSub }]}>NOM ET PRÉNOM(S) *</Text>
              <TextInput 
                style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]} 
                placeholder="Ex: Moussa Abdoulaye" 
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={newName}
                onChangeText={setNewName}
              />
              
              <Text style={[styles.formLabel, { color: colors.textSub }]}>CONTACT OU TITRE</Text>
              <TextInput 
                style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]} 
                placeholder="Téléphone ou profession" 
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={newContact}
                onChangeText={setNewContact}
              />

              <Text style={[styles.formLabel, { color: colors.textSub }]}>PARTIE REQUÉRANTE</Text>
              <View style={styles.roleGrid}>
                {(["ACCUSATION", "DEFENSE", "NEUTRAL"] as const).map((r) => {
                  const isActive = newRole === r;
                  const config = getRoleConfig(r);
                  return (
                    <TouchableOpacity 
                      key={r}
                      onPress={() => setNewRole(r)}
                      style={[
                        styles.roleChip, 
                        { 
                          borderColor: isActive ? config.color : colors.border,
                          backgroundColor: isActive ? config.bg : "transparent"
                        }
                      ]}
                    >
                      <Text style={[styles.roleChipText, { color: isActive ? config.color : colors.textSub }]}>
                        {config.label.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity onPress={handleAddWitness} style={[styles.confirmBtn, { backgroundColor: primaryColor }]}>
                <Text style={styles.confirmBtnText}>ENREGISTRER AU REGISTRE</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 160 },
  headerAlert: { flexDirection: "row", padding: 16, borderRadius: 20, marginBottom: 20, alignItems: "center", gap: 12 },
  headerAlertText: { fontSize: 12, flex: 1, fontWeight: "700" },

  card: { padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderLeftWidth: 8, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 3 } }) },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  name: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  roleLabel: { fontSize: 9, fontWeight: "900", textTransform: 'uppercase' },
  contactText: { fontSize: 12, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 15 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  
  summonBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, gap: 8 },
  summonText: { fontSize: 11, fontWeight: "900" },

  fab: { position: "absolute", bottom: 100, right: 20, width: 64, height: 64, borderRadius: 22, justifyContent: "center", alignItems: "center", elevation: 8, zIndex: 99 },
  
  empty: { alignItems: 'center', marginTop: 120 },
  emptyText: { marginTop: 15, fontSize: 14, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { padding: 24, borderTopLeftRadius: 36, borderTopRightRadius: 36, maxHeight: "90%" },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: "900" },
  formLabel: { fontSize: 10, fontWeight: "900", marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase" },
  input: { borderWidth: 1.5, borderRadius: 16, padding: 18, fontSize: 16, marginBottom: 20, fontWeight: "700" },
  roleGrid: { flexDirection: 'row', gap: 10, marginBottom: 35 },
  roleChip: { flex: 1, paddingVertical: 16, borderWidth: 1.5, borderRadius: 14, alignItems: "center" },
  roleChipText: { fontSize: 10, fontWeight: "900" },
  confirmBtn: { padding: 20, borderRadius: 18, alignItems: "center" },
  confirmBtnText: { color: "#FFF", fontWeight: "900", letterSpacing: 1, fontSize: 14 }
});