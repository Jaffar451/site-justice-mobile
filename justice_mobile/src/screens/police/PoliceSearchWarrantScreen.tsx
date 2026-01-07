import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert,
  Keyboard,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Simulation du service CID Niger
const mockSearch = async (query: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, target: "Boureima Salou", type: "MANDAT D'ARRÊT", status: "VALIDE", date: "2025-12-10", ref: "RG-442/25" },
        { id: 2, target: "Quartier Plateau, Rue PL-42", type: "PERQUISITION", status: "VALIDE", date: "2025-12-22", ref: "CR-102/25" },
        { id: 3, target: "Hamidou Moussa", type: "MANDAT D'AMENER", status: "EXÉCUTÉ", date: "2025-12-05", ref: "RG-009/25" },
      ].filter(i => i.target.toLowerCase().includes(query.toLowerCase()) || i.ref.toLowerCase().includes(query.toLowerCase())));
    }, 800);
  });
};

export default function PoliceSearchWarrantScreen({ navigation }: PoliceScreenProps<'PoliceSearchWarrant'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
    divider: isDark ? "#334155" : "#F8FAFC",
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const data = await mockSearch(searchQuery);
      setResults(data as any[]);
    } catch (e) {
      if (Platform.OS === 'web') window.alert("Liaison Interrompue avec le CID.");
      else Alert.alert("Liaison Interrompue", "Impossible de joindre le Registre Central.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALIDE": return "#EF4444"; // Rouge pour danger/action requise
      case "EXÉCUTÉ": return "#10B981"; // Vert pour dossier clos
      default: return "#64748B"; 
    }
  };

  const renderWarrant = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[
          styles.resultCard, 
          { backgroundColor: colors.bgCard, borderColor: colors.border, borderLeftColor: statusColor }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: primaryColor + "15" }]}>
            <Text style={[styles.typeBadgeText, { color: primaryColor }]}>{item.type}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={[styles.targetName, { color: colors.textMain }]}>{item.target.toUpperCase()}</Text>
        <Text style={[styles.refText, { color: colors.textSub }]}>Référence : {item.ref}</Text>
        
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSub} />
            <Text style={[styles.dateText, { color: colors.textSub }]}>Émis le {item.date}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={primaryColor} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Registre Mandats" showBack={true} />

      {/* ZONE DE RECHERCHE */}
      <View style={[styles.searchSection, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={primaryColor} />
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="Rechercher un individu ou un RG..."
            placeholderTextColor={colors.textSub}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.searchBtn, { backgroundColor: primaryColor }]}
          onPress={handleSearch}
        >
          <Ionicons name="arrow-forward" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {loading ? (
            <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.loaderText, { color: colors.textSub }]}>Interrogation du CID Niger...</Text>
            </View>
        ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderWarrant}
              contentContainerStyle={styles.listPadding}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="shield-checkmark-outline" size={80} color={colors.border} />
                  <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Vérification CID</Text>
                  <Text style={[styles.emptySub, { color: colors.textSub }]}>
                    Saisissez un nom pour vérifier la validité d'un titre de contrainte judiciaire.
                  </Text>
                </View>
              }
            />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchSection: { padding: 15, flexDirection: 'row', gap: 10, alignItems: 'center', borderBottomWidth: 1 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 15, height: 55, borderWidth: 1.5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '600' },
  searchBtn: { width: 55, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  listPadding: { padding: 15, paddingBottom: 100 },
  resultCard: { padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderLeftWidth: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeBadgeText: { fontSize: 9, fontWeight: "900" },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontWeight: "900" },
  targetName: { fontSize: 20, fontWeight: "900", marginBottom: 5 },
  refText: { fontSize: 13, fontWeight: "700", marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 15 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 11, fontWeight: '700' },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginTop: 20 },
  emptySub: { textAlign: 'center', marginTop: 10, lineHeight: 20, fontSize: 14 }
});