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

// ✅ Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAuthStore } from "../../stores/useAuthStore";
import { PoliceScreenProps } from "../../types/navigation";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
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
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState("");
  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.trim().length < 2) {
        setWarrants([]);
        return;
    }

    setLoading(true);
    try {
      const data = await getActiveWarrants();
      const filtered = data.filter((w: Warrant) => 
        w.personName.toLowerCase().includes(text.toLowerCase()) ||
        w.caseId.toString().includes(text)
      );
      setWarrants(filtered);
    } catch (error) {
      console.error("CID connection failed");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch(urgency) {
        case 'critical': return { color: '#EF4444', label: 'INDIVIDU DANGEREUX', icon: 'warning' };
        case 'high': return { color: '#F59E0B', label: 'PRIORITÉ ÉLEVÉE', icon: 'alert-circle' };
        default: return { color: '#3B82F6', label: 'MANDAT ACTIF', icon: 'document-text' };
    }
  };

  const renderWarrantItem = ({ item }: { item: Warrant }) => {
    const config = getUrgencyConfig(item.urgency);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.card, { backgroundColor: colors.bgCard, borderLeftColor: config.color, borderColor: colors.border }]}
        onPress={() => {
            // Optionnel: navigation vers une fiche détaillée
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.urgencyBadge, { backgroundColor: config.color + "15" }]}>
              <Ionicons name={config.icon as any} size={14} color={config.color} />
              <Text style={[styles.urgencyText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={[styles.caseId, { color: colors.textSub }]}>RG-{item.caseId}/26</Text>
        </View>

        <Text style={[styles.suspectName, { color: colors.textMain }]}>
          {item.personName.toUpperCase()}
        </Text>
        
        <View style={[styles.reasonBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          <Text style={[styles.reasonText, { color: colors.textSub }]}>
            <Text style={{ fontWeight: '900', color: colors.textMain }}>MOTIF :</Text> {item.reason}
          </Text>
        </View>
        
        <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
          <Text style={[styles.officerStamp, { color: colors.textSub }]}>Vérifié par {user?.lastname}</Text>
          <View style={styles.actionRow}>
             <Text style={[styles.detailsText, { color: primaryColor }]}>CONSULTER</Text>
             <Ionicons name="chevron-forward" size={16} color={primaryColor} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Fichier Central" showBack={true} />

      {/* ZONE DE RECHERCHE FIXE */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={primaryColor} />
          <TextInput
            placeholder="Nom ou Numéro de Dossier..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            style={[styles.input, { color: colors.textMain }]}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); setWarrants([]); }}>
                <Ionicons name="close-circle" size={22} color={colors.textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {loading && warrants.length === 0 ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.loadingText, { color: colors.textSub }]}>INTERROGATION DU CID NIGER...</Text>
            </View>
        ) : (
            <FlatList
              data={warrants}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listPadding}
              keyboardShouldPersistTaps="handled"
              renderItem={renderWarrantItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: colors.inputBg }]}>
                    <Ionicons 
                        name={search.length > 1 ? "shield-checkmark-outline" : "search-circle-outline"} 
                        size={70} 
                        color={colors.border} 
                    />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
                    {search.length > 1 ? "Aucun Mandat Actif" : "Recherche Judiciaire"}
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.textSub }]}>
                    {search.length > 1 
                        ? `Le sujet "${search.toUpperCase()}" n'est visé par aucune mesure de contrainte enregistrée.` 
                        : "Vérifiez instantanément les mandats d'arrêt et d'amener émis par les tribunaux."}
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
  loadingText: { marginTop: 15, fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  searchWrapper: { padding: 15, borderBottomWidth: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, borderRadius: 16, height: 56, borderWidth: 1.5 },
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700' },
  listPadding: { padding: 16, paddingBottom: 120 },
  card: { 
    marginBottom: 15, 
    padding: 20, 
    borderRadius: 22, 
    borderLeftWidth: 8, 
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  urgencyText: { fontSize: 9, fontWeight: '900' },
  caseId: { fontSize: 11, fontWeight: '800' },
  suspectName: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  reasonBox: { padding: 15, borderRadius: 12, marginBottom: 15 },
  reasonText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 15 },
  officerStamp: { fontSize: 10, fontWeight: '700', fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: 11, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginBottom: 10 },
  emptySub: { textAlign: "center", fontSize: 14, lineHeight: 22, fontWeight: '600' }
});