// PATH: src/screens/police/WarrantSearchScreen.tsx
import React, { useState, useCallback } from "react";
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
  Platform,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAuthStore } from "../../stores/useAuthStore";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ UI Components
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
  issuingAuthority?: string;
}

export default function WarrantSearchScreen({ navigation }: PoliceScreenProps<'PoliceSearchWarrant'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState("");
  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  /**
   * 📡 LOGIQUE DE RECHERCHE CID
   */
  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.trim().length < 2) {
        setWarrants([]);
        setHasSearched(false);
        return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      // Appel au service CID (Simulé ou Réel)
      const data = await getActiveWarrants();
      const filtered = data.filter((w: Warrant) => 
        w.personName.toLowerCase().includes(text.toLowerCase()) ||
        w.caseId.toString().includes(text)
      );
      setWarrants(filtered);
    } catch (error) {
      console.error("CID connection failed", error);
      if (Platform.OS === 'web') window.alert("Liaison avec le CID Niger interrompue.");
      else Alert.alert("Erreur Système", "Impossible d'interroger le fichier central.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch(urgency) {
        case 'critical': return { color: '#EF4444', label: 'INDIVIDU DANGEREUX', icon: 'warning' };
        case 'high': return { color: '#F59E0B', label: 'PRIORITÉ ÉLEVÉE', icon: 'alert-circle' };
        default: return { color: primaryColor, label: 'MANDAT ACTIF', icon: 'document-text' };
    }
  };

  const renderWarrantItem = ({ item }: { item: Warrant }) => {
    const config = getUrgencyConfig(item.urgency);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[
          styles.card, 
          { 
            backgroundColor: colors.bgCard, 
            borderLeftColor: config.color, 
            borderColor: colors.border 
          }
        ]}
        onPress={() => {
          Alert.alert("Fiche Individu", `Consulter les détails du mandat pour ${item.personName} ?`);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.urgencyBadge, { backgroundColor: config.color + "15" }]}>
              <Ionicons name={config.icon as any} size={12} color={config.color} />
              <Text style={[styles.urgencyText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={[styles.caseId, { color: colors.textSub }]}>RP-{item.caseId}/26</Text>
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
          <View style={styles.officerRow}>
            <Ionicons name="finger-print" size={14} color={colors.textSub} />
            <Text style={[styles.officerStamp, { color: colors.textSub }]}>Vérifié par Off. {user?.lastname}</Text>
          </View>
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

      {/* 🔍 ZONE DE RECHERCHE FIXE */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={primaryColor} />
          <TextInput
            placeholder="Nom du suspect ou N° de Dossier..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            style={[styles.input, { color: colors.textMain }]}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); setWarrants([]); setHasSearched(false); }}>
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
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                    <Ionicons 
                        name={hasSearched ? "shield-checkmark-outline" : "finger-print-outline"} 
                        size={70} 
                        color={colors.border} 
                    />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
                    {hasSearched ? "Aucun Mandat Actif" : "Contrôle d'Identité"}
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.textSub }]}>
                    {hasSearched 
                        ? `Le sujet "${search.toUpperCase()}" n'est visé par aucune mesure de contrainte au fichier national.` 
                        : "Saisissez l'identité d'un individu pour vérifier s'il fait l'objet d'un mandat d'arrêt ou d'amener."}
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
  loadingText: { marginTop: 15, fontWeight: '900', fontSize: 10, letterSpacing: 1.5 },
  searchWrapper: { padding: 15, borderBottomWidth: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, borderRadius: 18, height: 60, borderWidth: 1.5 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '700' },
  listPadding: { padding: 16, paddingBottom: 120 },
  card: { 
    marginBottom: 16, 
    padding: 20, 
    borderRadius: 24, 
    borderLeftWidth: 8, 
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  urgencyText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  caseId: { fontSize: 11, fontWeight: '800', opacity: 0.8 },
  suspectName: { fontSize: 21, fontWeight: "900", marginBottom: 12, letterSpacing: -0.5 },
  reasonBox: { padding: 15, borderRadius: 16, marginBottom: 20 },
  reasonText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 18 },
  officerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  officerStamp: { fontSize: 10, fontWeight: '700', fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginBottom: 10 },
  emptySub: { textAlign: "center", fontSize: 14, lineHeight: 22, fontWeight: '500' }
});