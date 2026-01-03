import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAppTheme } from "../../theme/AppThemeProvider";
import { ProsecutorScreenProps } from "../../types/navigation";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Données simulées étendues (Région du Niger)
const MOCK_CASES = [
  { id: 401, title: "Vol avec effraction en réunion", suspect: "Adamou B. & Alassane S.", status: "nouveau", date: "02/01/2026", unit: "Commissariat Central Niamey" },
  { id: 402, title: "Trafic de stupéfiants (Saisie 2kg)", suspect: "Moussa K.", status: "en_cours", date: "01/01/2026", unit: "Gendarmerie Nationale - Maradi" },
  { id: 403, title: "Abus de confiance aggravé", suspect: "Mariama T.", status: "nouveau", date: "02/01/2026", unit: "Commissariat de Ville - Zinder" },
  { id: 404, title: "Homicide involontaire (Accident)", suspect: "Ibrahim J.", status: "instruction", date: "31/12/2025", unit: "DPJ Niamey" },
];

export default function ProsecutorCaseListScreen({ navigation }: ProsecutorScreenProps<'ProsecutorCaseList'>) {
  const { isDark } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    justicePrimary: "#7C2D12", // Bordeaux Justice Institutionnel
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  // Filtrage intelligent des dossiers
  const filteredCases = useMemo(() => {
    return MOCK_CASES.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.suspect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery) ||
      c.unit.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nouveau': return { bg: isDark ? "#450A0A" : "#FEE2E2", text: "#EF4444", label: "À DÉCIDER" };
      case 'en_cours': return { bg: isDark ? "#1E3A8A" : "#DBEAFE", text: "#3B82F6", label: "ENRÔLÉ" };
      case 'instruction': return { bg: isDark ? "#14532D" : "#DCFCE7", text: "#10B981", label: "INSTRUIT" };
      default: return { bg: colors.divider, text: colors.textSub, label: status.toUpperCase() };
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Registre des Transmissions" showBack />

      {/* 📊 RÉSUMÉ RAPIDE DU PARQUET */}
      <View style={[styles.statsBar, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#EF4444" }]}>
            {MOCK_CASES.filter(c => c.status === 'nouveau').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSub }]}>URGENCES PV</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.justicePrimary }]}>{MOCK_CASES.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSub }]}>TOTAL RÉCEPTION</Text>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {/* 🔍 RECHERCHE AVANCÉE */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.textSub} />
            <TextInput
              placeholder="Suspect, N° PV, unité de gendarmerie..."
              placeholderTextColor={colors.textSub}
              style={[styles.searchInput, { color: colors.textMain }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <FlatList
          data={filteredCases}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={60} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun dossier ne correspond à votre recherche.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <TouchableOpacity 
                activeOpacity={0.85}
                style={[styles.caseCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                onPress={() => navigation.navigate('ProsecutorCaseDetail', { caseId: item.id })}
              >
                <View style={styles.caseHeader}>
                  <View style={styles.refContainer}>
                    <Ionicons name="document-text" size={16} color={colors.justicePrimary} />
                    <Text style={[styles.caseRef, { color: colors.justicePrimary }]}>PV N° {item.id}/2026</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>

                <Text style={[styles.caseTitle, { color: colors.textMain }]}>{item.title}</Text>
                
                <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-circle-outline" size={16} color={colors.textSub} />
                        <Text style={[styles.infoText, { color: colors.textSub }]}>Suspect(s) : <Text style={{color: colors.textMain}}>{item.suspect}</Text></Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={16} color={colors.textSub} />
                        <Text style={[styles.infoText, { color: colors.textSub }]}>Origine : <Text style={{color: colors.textMain}}>{item.unit}</Text></Text>
                    </View>
                </View>

                <View style={[styles.footer, { borderTopColor: colors.divider }]}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSub} />
                    <Text style={[styles.dateText, { color: colors.textSub }]}>Reçu le {item.date}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <Text style={[styles.actionText, { color: colors.justicePrimary }]}>OPÉRER UN CHOIX</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color={colors.justicePrimary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsBar: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3 }, android: { elevation: 3 } }) },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },
  statDivider: { width: 1, height: '60%', alignSelf: 'center' },

  searchWrapper: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 54, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600' },

  listPadding: { padding: 18, paddingBottom: 160 },
  caseCard: { 
    padding: 22, 
    borderRadius: 28, 
    marginBottom: 16, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' }
    })
  },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  refContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  caseRef: { fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  caseTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12, lineHeight: 24 },
  
  infoGrid: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, fontWeight: '600' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, marginTop: 20, paddingTop: 15 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },

  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', marginTop: 15, fontSize: 14, fontWeight: '600', lineHeight: 22 }
});