import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

// ✅ 1. Imports Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getMyComplaints } from "../../services/complaint.service";

interface DecisionCase {
  id: number;
  provisionalOffence?: string;
  status: string;
  filedAt: string;
  createdAt: string;
  updatedAt?: string;
  verdict?: string; 
}

export default function JudgeDecisionsScreen({ navigation }: JudgeScreenProps<'JudgeDecisions'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary; 
  
  const [search, setSearch] = useState("");

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
  };

  // ✅ 3. Fetch avec React Query
  const { data: rawDecisions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['judge-decisions-history'],
    queryFn: async () => {
      const data = await getMyComplaints();
      // On ne garde que les dossiers clôturés/jugés
      return data.filter((c: any) => 
        ["closed", "decision", "resolved", "jugée", "non_lieu", "classée_sans_suite"].includes(c.status)
      ) as DecisionCase[];
    }
  });

  // ✅ 4. Filtrage et Tri (Memoïsé)
  const filteredDecisions = useMemo(() => {
    if (!rawDecisions) return [];

    let results = [...rawDecisions];

    // Tri par date décroissante (plus récent en premier)
    results.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.filedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.filedAt || b.createdAt).getTime();
        return dateB - dateA;
    });

    // Filtre de recherche
    if (search.trim()) {
      const lower = search.toLowerCase();
      results = results.filter(d => 
        (d.provisionalOffence?.toLowerCase() || "").includes(lower) || 
        d.id.toString().includes(lower)
      );
    }

    return results;
  }, [rawDecisions, search]);

  const getVerdictBadge = (verdict?: string) => {
    const v = (verdict || "").toUpperCase();
    
    if (v.includes("RELAXE") || v.includes("INNOCENT") || v.includes("ACQUITTAL")) {
      return { color: "#10B981", label: "RELAXÉ", icon: "shield-checkmark-outline" };
    }
    if (v.includes("NON_LIEU") || v.includes("DISMISSED")) {
      return { color: "#64748B", label: "NON-LIEU", icon: "archive-outline" };
    }
    // Par défaut
    return { color: "#EF4444", label: "CONDAMNATION", icon: "hammer-outline" };
  };

  const renderItem = ({ item }: { item: DecisionCase }) => {
    const badge = getVerdictBadge(item.verdict);
    
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        // On renvoie vers le détail du dossier pour voir l'historique complet
        onPress={() => navigation.navigate("CaseDetail", { caseId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.caseId, { color: primaryColor }]}>MINUTE RG #{item.id}</Text>
          <Text style={[styles.date, { color: colors.textSub }]}>
            {new Date(item.updatedAt || item.filedAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={2}>
          {item.provisionalOffence || "Information Judiciaire close"}
        </Text>

        <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
          <View style={[styles.badgeContainer, { backgroundColor: badge.color + "15" }]}>
            <Ionicons name={badge.icon as any} size={14} color={badge.color} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <View style={styles.actionLink}>
            <Text style={[styles.actionText, { color: primaryColor }]}>Consulter l'acte</Text>
            <Ionicons name="chevron-forward" size={16} color={primaryColor} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Registre des Minutes" showBack />

      {/* 🔍 Barre de Recherche */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSub} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Rechercher minute ou n° dossier..."
          placeholderTextColor={colors.textSub}
          style={[styles.searchInput, { color: colors.textMain }]}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={colors.textSub} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.body, { backgroundColor: colors.bgMain }]}>
        {isLoading && !isRefetching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: colors.textSub }]}>Accès au coffre-fort numérique...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDecisions}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={80} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>
                  Aucune minute de jugement n'est encore enregistrée pour votre cabinet.
                </Text>
              </View>
            }
            renderItem={renderItem}
          />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 140, paddingTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: '700' },
  
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginHorizontal: 16, 
    marginTop: 15, 
    marginBottom: 10, 
    paddingHorizontal: 16, 
    height: 52, 
    borderRadius: 16, 
    borderWidth: 1 
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  
  card: { 
    padding: 18, 
    marginBottom: 16, 
    borderRadius: 22, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }
    })
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: 'center' },
  caseId: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  date: { fontSize: 11, fontWeight: "700", opacity: 0.8 },
  
  title: { fontSize: 16, fontWeight: "800", marginBottom: 18, lineHeight: 22 },
  
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 14 },
  badgeContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 6 },
  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  
  actionLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '800' },
  
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 15, fontWeight: '600', opacity: 0.8, lineHeight: 22 },
});