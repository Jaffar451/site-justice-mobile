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
  Platform,
  ViewStyle
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// ✅ Composants de mise en page
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Simulation de service (CID Niger)
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
  // ✅ 2. Thème & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
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
      case "VALIDE": return "#16A34A"; 
      case "EXÉCUTÉ": return "#3B82F6"; 
      default: return "#EF4444"; 
    }
  };

  const renderWarrant = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        style={[
          styles.resultCard, 
          { 
            backgroundColor: colors.bgCard, 
            borderColor: colors.border,
            borderLeftColor: statusColor
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: primaryColor + "20" }]}>
            <Text style={[styles.typeBadgeText, { color: isDark ? "#BAE6FD" : primaryColor }]}>{item.type}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={[styles.targetName, { color: colors.textMain }]}>{item.target.toUpperCase()}</Text>
        <Text style={[styles.refText, { color: colors.textSub }]}>Référence : {item.ref}</Text>
        
        <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSub} />
            <Text style={[styles.dateText, { color: colors.textSub }]}>Émis le {new Date(item.date).toLocaleDateString("fr-FR")}</Text>
          </View>
          <View style={styles.actionLink}>
             <Text style={[styles.detailsText, { color: primaryColor }]}>DÉTAILS</Text>
             <Ionicons name="chevron-forward" size={14} color={primaryColor} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Interrogation Registre" showBack={true} />

      {/* 🔍 ZONE DE RECHERCHE FIXE */}
      <View style={[styles.searchSection, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={primaryColor} />
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="Nom, Adresse ou N° de dossier..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => {setSearchQuery(""); setResults([]);}}>
              <Ionicons name="close-circle" size={20} color={colors.textSub} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          activeOpacity={0.8}
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
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={results.length > 0 ? (
                <Text style={[styles.resultCount, { color: colors.textSub }]}>
                    {results.length} ACTE(S) IDENTIFIÉ(S) DANS LA BASE
                </Text>
            ) : null}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                    <Ionicons 
                    name={searchQuery !== "" ? "search-outline" : "shield-checkmark-outline"} 
                    size={70} 
                    color={colors.border} 
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
                    {searchQuery !== "" ? "Aucun acte trouvé" : "Aide à la Décision"}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSub }]}>
                    {searchQuery !== "" 
                    ? "Cette recherche ne retourne aucune mesure de contrainte active." 
                    : "Vérifiez instantanément la validité d'un mandat judiciaire."}
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
  searchSection: { 
    padding: 16, 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center',
    borderBottomWidth: 1,
    zIndex: 10
  },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    borderRadius: 18, 
    height: 56, 
    borderWidth: 1.5,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600' },
  searchBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 4,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
        web: { boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }
    })
  },
  
  listPadding: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 140 },
  resultCount: { fontSize: 10, fontWeight: "900", letterSpacing: 1, marginBottom: 15, textAlign: 'center', opacity: 0.8 },
  resultCard: { 
    padding: 22, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderLeftWidth: 8,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
        android: { elevation: 3 },
        web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  targetName: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5, marginBottom: 6 },
  refText: { fontSize: 13, fontWeight: "700", marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1.5, paddingTop: 18 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 11, fontWeight: '800' },
  actionLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontWeight: '900', fontSize: 11 },
  
  loaderBox: { marginTop: 100, alignItems: 'center' },
  loaderText: { marginTop: 15, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 },
  
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconCircle: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginBottom: 10 },
  emptySub: { textAlign: 'center', lineHeight: 22, fontSize: 14, fontWeight: '600', opacity: 0.8 }
});