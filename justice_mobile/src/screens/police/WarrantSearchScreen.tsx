import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity, 
  Keyboard,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { useAuthStore } from "../../stores/useAuthStore";
import { PoliceScreenProps } from "../../types/navigation";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getActiveWarrants } from "../../services/arrestWarrant.service";

interface Warrant {
  id: number;
  caseId: number;
  personName: string;
  reason: string;
  urgency: "normal" | "high" | "critical";
  status: string;
}

export default function WarrantSearchScreen({ navigation }: PoliceScreenProps<'PoliceSearchWarrant'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState("");
  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  /**
   * 🔍 INTERROGATION DU FICHIER CENTRAL (CID NIGER)
   */
  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length < 2) {
        setWarrants([]);
        return;
    }

    setLoading(true);
    try {
      const data = await getActiveWarrants();
      const filtered = data.filter((w: Warrant) => 
        w.personName.toLowerCase().includes(text.toLowerCase())
      );
      setWarrants(filtered);
    } catch (error) {
      if (Platform.OS === 'web') window.alert("Liaison interrompue avec le CID.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch(urgency) {
        case 'critical': return { color: '#DC2626', label: 'INDIVIDU DANGEREUX', icon: 'warning' };
        case 'high': return { color: '#EA580C', label: 'PRIORITÉ HAUTE', icon: 'alert-circle' };
        default: return { color: primaryColor, label: 'MANDAT VALIDE', icon: 'document-text' };
    }
  };

  const renderWarrantItem = ({ item }: { item: Warrant }) => {
    const config = getUrgencyConfig(item.urgency);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: colors.bgCard, borderLeftColor: config.color, borderColor: colors.border }]}
        onPress={() => {/* Navigation vers détail mandat */}}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.urgencyBadge, { backgroundColor: config.color + "15" }]}>
              <Ionicons name={config.icon as any} size={14} color={config.color} />
              <Text style={[styles.urgencyText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={[styles.caseId, { color: colors.textSub }]}>N° RG {item.caseId}/25</Text>
        </View>

        <Text style={[styles.suspectName, { color: colors.textMain }]}>
          {item.personName.toUpperCase()}
        </Text>
        
        <View style={[styles.reasonBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          <Text style={[styles.reasonText, { color: colors.textSub }]}>
            <Text style={[styles.reasonLabel, { color: colors.textMain }]}>MOTIF :</Text> {item.reason}
          </Text>
        </View>
        
        <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
          <Text style={[styles.officerStamp, { color: colors.textSub }]}>Interrogé par OPJ {user?.lastname}</Text>
          <View style={styles.actionRow}>
             <Text style={[styles.detailsText, { color: primaryColor }]}>VOIR FICHE</Text>
             <Ionicons name="arrow-forward" size={16} color={primaryColor} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Contrôle d'Identité" showBack={true} />

      {/* 🔍 BARRE DE RECHERCHE DYNAMIQUE */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={primaryColor} />
          <TextInput
            placeholder="Nom du suspect ou N° de dossier..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            style={[styles.input, { color: colors.textMain }]}
            value={search}
            onChangeText={handleSearch}
            autoFocus={true}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={22} color={colors.textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {loading && warrants.length === 0 ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.loadingText, { color: colors.textSub }]}>Liaison Fichier Central...</Text>
            </View>
        ) : (
            <FlatList
            data={warrants}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={renderWarrantItem}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                    <Ionicons 
                        name={search.length > 1 ? "shield-checkmark-outline" : "finger-print"} 
                        size={80} 
                        color={colors.border} 
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
                    {search.length > 1 ? "Aucun Mandat Trouvé" : "Terminal CID Niger"}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSub }]}>
                    {search.length > 1 
                        ? `Le sujet "${search.toUpperCase()}" n'est actuellement visé par aucun mandat actif.` 
                        : "Interrogez la base de données criminelle nationale pour vérifier les mesures de contrainte."}
                </Text>
                </View>
            }
            />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  
  searchWrapper: { padding: 16, borderBottomWidth: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, borderRadius: 16, height: 56, borderWidth: 1.5 },
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700' },

  listPadding: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 140 },
  
  card: { 
    marginBottom: 16, 
    padding: 20, 
    borderRadius: 24, 
    borderLeftWidth: 8, 
    borderWidth: 1,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
        android: { elevation: 3 },
        web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  urgencyText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  caseId: { fontSize: 11, fontWeight: '900' },
  
  suspectName: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginBottom: 8 },
  
  reasonBox: { padding: 14, borderRadius: 12, marginBottom: 18 },
  reasonText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  reasonLabel: { fontWeight: '900' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 15 },
  officerStamp: { fontSize: 11, fontWeight: '700', fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: 11, fontWeight: '900' },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5, marginBottom: 10 },
  emptySub: { textAlign: "center", fontSize: 14, lineHeight: 22, fontWeight: '600' }
});