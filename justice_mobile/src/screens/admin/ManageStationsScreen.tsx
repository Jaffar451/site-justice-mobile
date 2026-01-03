import React, { useState, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert, ScrollView, Platform, StatusBar } from "react-native";
import { 
  Button, Card, Text, FAB, IconButton, Portal, Modal, 
  TextInput, Avatar, ActivityIndicator, Chip, Searchbar
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker"; 
import * as Location from 'expo-location';
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ✅ Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider";
import { AdminScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { 
  getAllStations, 
  createStation, 
  updateStation, 
  PoliceStation 
} from "../../services/policeStation.service";

const NIGER_DISTRICTS = ["Niamey", "Agadez", "Diffa", "Dosso", "Maradi", "Tahoua", "Tillabéri", "Zinder"];

export default function ManageStationsScreen({ navigation }: AdminScreenProps<'ManageStations'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();
  
  const [visible, setVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'ALL' | 'POLICE' | 'GENDARMERIE'>('ALL');

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  const [formData, setFormData] = useState({
    name: "", 
    type: "POLICE" as 'POLICE' | 'GENDARMERIE',
    city: "",
    district: "Niamey", 
    address: "", 
    latitude: "", 
    longitude: "", 
    phone: "",
    status: "active" as 'active' | 'inactive'
  });

  // ✅ 1. RÉCUPÉRATION DES DONNÉES
  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ['stations'],
    queryFn: getAllStations,
  });

  // Filtrage et recherche côté client
  const stationsList = useMemo(() => {
    let list: PoliceStation[] = [];
    if (Array.isArray(rawData)) list = rawData;
    else if ((rawData as any)?.data) list = (rawData as any).data;

    return list.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'ALL' || item.type === filterType;
      return matchSearch && matchType;
    });
  }, [rawData, searchQuery, filterType]);

  // ✅ 2. MUTATION
  const mutation = useMutation({
    mutationFn: (data: any) => editingId ? updateStation(editingId, data) : createStation(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stations'] });
        hideModal();
        Alert.alert("Succès", editingId ? "Unité mise à jour." : "Unité enregistrée.");
    },
    onError: () => Alert.alert("Erreur", "Opération échouée.")
  });

  const handleGetLocation = async () => {
    setIsLocating(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("GPS", "L'accès est nécessaire pour le maillage territorial.");
      setIsLocating(false);
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString()
      }));
    } catch (err) {
      Alert.alert("Erreur GPS", "Position introuvable.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.city) return Alert.alert("Incomplet", "Nom et Ville requis.");
    mutation.mutate({ 
      ...formData, 
      latitude: formData.latitude ? parseFloat(formData.latitude) : null, 
      longitude: formData.longitude ? parseFloat(formData.longitude) : null 
    });
  };

  const openEditModal = (item: PoliceStation) => {
    setEditingId(item.id);
    setFormData({
        name: item.name,
        type: item.type as any,
        city: item.city,
        district: item.district,
        address: item.address || "",
        latitude: item.latitude?.toString() || "",
        longitude: item.longitude?.toString() || "",
        phone: item.phone || "",
        status: item.status as any
    });
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setEditingId(null);
    setFormData({ name: "", type: "POLICE", city: "", district: "Niamey", address: "", latitude: "", longitude: "", phone: "", status: "active" });
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Registre des Unités" showBack={true} />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {/* 🔍 BARRE DE RECHERCHE & FILTRES */}
        <View style={styles.headerToolBar}>
            <Searchbar
                placeholder="Rechercher une unité..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchBar, { backgroundColor: colors.bgCard }]}
                inputStyle={{ color: colors.textMain }}
                iconColor={colors.textSub}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                {(['ALL', 'POLICE', 'GENDARMERIE'] as const).map((t) => (
                    <Chip 
                        key={t}
                        selected={filterType === t}
                        onPress={() => setFilterType(t)}
                        style={[styles.filterChip, { backgroundColor: filterType === t ? primaryColor : colors.bgCard }]}
                        textStyle={{ color: filterType === t ? "#FFF" : colors.textSub, fontSize: 10, fontWeight: '700' }}
                    >
                        {t === 'ALL' ? 'TOUTES' : t}
                    </Chip>
                ))}
            </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={primaryColor} /></View>
        ) : (
          <FlatList
            data={stationsList}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            onRefresh={refetch}
            refreshing={isLoading}
            renderItem={({ item }) => (
              <Card style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderLeftColor: item.type === 'POLICE' ? "#3B82F6" : "#10B981" }]}>
                <Card.Title
                  title={item.name}
                  titleStyle={[styles.cardTitle, { color: colors.textMain }]}
                  subtitleStyle={{ color: colors.textSub }}
                  subtitle={`${item.type} • ${item.city}`}
                  left={(props) => (
                    <Avatar.Icon 
                      {...props} 
                      icon={item.type === 'POLICE' ? "shield-account" : "shield-cross"} 
                      style={{ backgroundColor: item.type === 'POLICE' ? "#E0E7FF" : "#D1FAE5" }} 
                      color={item.type === 'POLICE' ? "#1E3A8A" : "#065F46"} 
                    />
                  )}
                  right={(props) => (
                    <IconButton 
                      {...props}
                      icon="cog-outline" 
                      iconColor={colors.textSub}
                      onPress={() => openEditModal(item)} 
                    />
                  )}
                />
                <Card.Content>
                    <Text style={[styles.addressText, { color: colors.textSub }]}>
                        <Ionicons name="location-outline" size={12} /> {item.address || "Adresse non renseignée"}, {item.district}
                    </Text>
                </Card.Content>
              </Card>
            )}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Ionicons name="business-outline" size={60} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucune unité trouvée.</Text>
                </View>
            }
          />
        )}
      </View>

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={[styles.modal, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.modalTitle, { color: colors.textMain }]}>
            {editingId ? "ÉDITION ADMINISTRATIVE" : "ENRÔLEMENT UNITÉ"}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.chipRow}>
                <Chip 
                  selected={formData.type === 'POLICE'} 
                  onPress={() => setFormData(prev => ({...prev, type: 'POLICE'}))}
                  style={[styles.typeChip, { backgroundColor: formData.type === 'POLICE' ? "#3B82F6" : colors.inputBg }]}
                  textStyle={{ color: formData.type === 'POLICE' ? "#FFF" : colors.textSub }}
                >POLICE</Chip>
                <Chip 
                  selected={formData.type === 'GENDARMERIE'} 
                  onPress={() => setFormData(prev => ({...prev, type: 'GENDARMERIE'}))}
                  style={[styles.typeChip, { backgroundColor: formData.type === 'GENDARMERIE' ? "#10B981" : colors.inputBg }]}
                  textStyle={{ color: formData.type === 'GENDARMERIE' ? "#FFF" : colors.textSub }}
                >GENDARMERIE</Chip>
            </View>

            <TextInput 
                label="Désignation" 
                mode="outlined" 
                value={formData.name} 
                onChangeText={t => setFormData(prev => ({...prev, name: t}))} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                textColor={colors.textMain}
                outlineColor={colors.border}
            />
            
            <View style={styles.row}>
                <TextInput 
                    label="Ville" 
                    mode="outlined" 
                    value={formData.city} 
                    onChangeText={t => setFormData(prev => ({...prev, city: t}))} 
                    style={[styles.input, {flex: 1, marginRight: 8, backgroundColor: colors.inputBg}]}
                    textColor={colors.textMain}
                    outlineColor={colors.border}
                />
                <View style={[styles.pickerContainer, { flex: 1, borderColor: colors.border, backgroundColor: colors.inputBg }]}>
                    <Picker
                        selectedValue={formData.district}
                        onValueChange={(val) => setFormData(prev => ({...prev, district: val}))}
                        style={{ color: colors.textMain }}
                    >
                        {NIGER_DISTRICTS.map(d => <Picker.Item key={d} label={d} value={d} color={isDark ? "#FFF" : "#000"} />)}
                    </Picker>
                </View>
            </View>

            <TextInput label="Contact" mode="outlined" value={formData.phone} onChangeText={t => setFormData(prev => ({...prev, phone: t}))} style={[styles.input, { backgroundColor: colors.inputBg }]} textColor={colors.textMain} outlineColor={colors.border} keyboardType="phone-pad" />
            
            <View style={styles.row}>
              <TextInput label="Lat" mode="outlined" value={formData.latitude} style={{flex: 1, marginRight: 8, backgroundColor: colors.inputBg}} editable={false} textColor={colors.textMain} outlineColor={colors.border} />
              <TextInput label="Long" mode="outlined" value={formData.longitude} style={{flex: 1, backgroundColor: colors.inputBg}} editable={false} textColor={colors.textMain} outlineColor={colors.border} />
              <IconButton 
                icon="crosshairs-gps" 
                mode="contained" 
                containerColor={primaryColor} 
                iconColor="#FFF" 
                loading={isLocating} 
                onPress={handleGetLocation} 
                style={{marginTop: 6}}
              />
            </View>

            <Button 
                mode="contained" 
                onPress={handleSave} 
                loading={mutation.isPending}
                style={styles.saveBtn} 
                buttonColor={primaryColor}
            >
              {editingId ? "METTRE À JOUR" : "VALIDER"}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      <FAB 
        icon="plus" 
        style={[styles.fab, { backgroundColor: primaryColor }]} 
        onPress={() => { setEditingId(null); setVisible(true); }} 
        color="#FFF" 
      />
      
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  headerToolBar: { padding: 16, gap: 12 },
  searchBar: { elevation: 0, borderWidth: 1, borderRadius: 12, height: 48 },
  filterRow: { flexDirection: 'row', marginBottom: 5 },
  filterChip: { marginRight: 8, height: 32, justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 160 },
  card: { marginBottom: 16, borderRadius: 20, borderLeftWidth: 8, elevation: 2 },
  cardTitle: { fontWeight: '900', fontSize: 16 },
  addressText: { fontSize: 12, fontWeight: '700', marginTop: -5 },
  emptyText: { textAlign: 'center', fontSize: 16, fontWeight: '700', marginTop: 15 },
  modal: { padding: 25, margin: 20, borderRadius: 28, maxHeight: '85%', ...Platform.select({ web: { width: 500, alignSelf: 'center' } }) },
  modalTitle: { fontSize: 12, fontWeight: "900", marginBottom: 20, textAlign: "center", letterSpacing: 2 },
  input: { marginBottom: 12 },
  chipRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  typeChip: { borderRadius: 10 },
  pickerContainer: { borderWidth: 1, borderRadius: 4, marginBottom: 12, height: 50, justifyContent: 'center' },
  row: { flexDirection: "row", alignItems: "center" },
  saveBtn: { marginTop: 20, borderRadius: 12, height: 50, justifyContent: 'center' },
  fab: { position: "absolute", right: 20, bottom: 100, borderRadius: 16, zIndex: 99 }
});