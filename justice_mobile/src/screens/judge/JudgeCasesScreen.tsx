import React, { useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

// ✅ 1. Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getAllComplaints, Complaint } from "../../services/complaint.service";

interface ExtendedCase extends Complaint {
  trackingCode?: string;
  caseNumber?: string;
  provisionalOffence?: string;
}

interface CaseData {
  id: number;
  reference: string;
  title: string;
  status: string;
  plaintiff: string;
  date: string;
}

export default function JudgeCasesScreen({ navigation }: JudgeScreenProps<'JudgeCases'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    bannerBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  // ✅ 3. Fetch avec React Query
  const { data: rawCases, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['judge-cases-list'],
    queryFn: async () => {
      const data = await getAllComplaints();
      return data as ExtendedCase[];
    }
  });

  // ✅ 4. Filtrage et Formatage (Memoïsé)
  const cases: CaseData[] = useMemo(() => {
    if (!rawCases) return [];

    return rawCases
      .filter(c => 
        ["instruction", "saisi_juge", "audience_programmée", "poursuite"].includes(c.status)
      )
      .map((c) => ({
        id: c.id,
        reference: c.trackingCode || c.caseNumber || `RG-${c.id}`,
        title: c.provisionalOffence || "Information Judiciaire ouverte",
        status: c.status,
        plaintiff: c.citizen ? `${c.citizen.lastname} ${c.citizen.firstname}` : "Plainte Étatique",
        date: new Date(c.filedAt).toLocaleDateString("fr-FR")
      }));
  }, [rawCases]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'instruction': 
        return { bg: primaryColor + '20', text: isDark ? "#BAE6FD" : primaryColor, label: 'INSTRUCTION' };
      case 'audience_programmée': 
        return { bg: isDark ? "#064E3B" : '#E8F5E9', text: isDark ? "#6EE7B7" : '#2E7D32', label: 'AU RÔLE' };
      case 'saisi_juge':
        return { bg: isDark ? "#431407" : '#FFF3E0', text: isDark ? "#FB923C" : '#E65100', label: 'NOUVEAU' };
      default: 
        return { bg: isDark ? "#334155" : '#F1F5F9', text: colors.textSub, label: 'À TRAITER' };
    }
  };

  const renderItem = ({ item }: { item: CaseData }) => {
    const statusStyle = getStatusStyle(item.status);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        style={[
          styles.card, 
          { 
            backgroundColor: colors.bgCard,
            borderColor: colors.border
          }
        ]}
        // ✅ Navigation vers le détail
        onPress={() => navigation.navigate("CaseDetail", { caseId: item.id })} 
      >
        <View style={styles.header}>
          <Text style={[styles.ref, { color: primaryColor }]}>{item.reference}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {statusStyle.label}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.row}>
                <Ionicons name="person-outline" size={14} color={colors.textSub} />
                <Text style={[styles.infoText, { color: colors.textSub }]}>{item.plaintiff}</Text>
            </View>

            <View style={styles.row}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSub} />
                <Text style={[styles.infoText, { color: colors.textSub }]}>{item.date}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Registre du Cabinet" showMenu={true} />

      <View style={[styles.banner, { backgroundColor: colors.bannerBg, borderBottomColor: colors.border }]}>
          <View style={styles.row}>
            <Ionicons name="ribbon-outline" size={16} color={primaryColor} style={{ marginRight: 8 }} />
            <Text style={[styles.bannerText, { color: colors.textSub }]}>
              Magistrat : <Text style={[styles.boldText, { color: colors.textMain }]}>{user?.lastname?.toUpperCase()}</Text>
            </Text>
          </View>
          <Text style={[styles.caseCount, { color: primaryColor }]}>{cases.length} Dossier(s)</Text>
      </View>
      
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {isLoading && !isRefetching ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.loadingText, { color: colors.textSub }]}>Synchronisation du registre...</Text>
            </View>
        ) : (
            <FlatList
              data={cases}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                    <Ionicons name="file-tray-outline" size={80} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>
                    Votre cabinet ne compte aucun dossier actif.
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
  listContainer: { padding: 16, paddingBottom: 150 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  banner: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerText: { fontSize: 13 },
  boldText: { fontWeight: '900' },
  caseCount: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  
  card: { 
    padding: 22, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
        android: { elevation: 3 },
        web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }
    })
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, alignItems: 'center' },
  ref: { fontWeight: "900", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 20, lineHeight: 26 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 16 },
  row: { flexDirection: "row", alignItems: "center" },
  infoText: { fontSize: 12, marginLeft: 8, fontWeight: '700' },
  
  empty: { alignItems: 'center', marginTop: 120, paddingHorizontal: 60 },
  emptyText: { marginTop: 20, textAlign: 'center', fontSize: 15, lineHeight: 24, fontWeight: '600' },
});