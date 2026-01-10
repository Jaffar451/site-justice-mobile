// PATH: src/screens/judge/JudgeCasesScreen.tsx
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

// ✅ Architecture & Logic
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
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
  
  // ✅ Identité Cabinet d'Instruction (Violet)
  const JUDGE_ACCENT = "#7C3AED"; 
  const { user } = useAuthStore();

  // Palette dynamique
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    bannerBg: isDark ? "#1E293B" : "#FFFFFF",
  };

  // 📡 Synchronisation avec le Registre Central
  const { data: rawCases, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['judge-cases-list'],
    queryFn: async () => {
      const data = await getAllComplaints();
      return data as ExtendedCase[];
    }
  });

  // 🔍 Filtrage des dossiers au stade judiciaire (2026)
  const cases: CaseData[] = useMemo(() => {
    if (!rawCases) return [];

    return rawCases
      .filter(c => 
        // On ne garde que ce qui est au Cabinet (Instruction ou Saisi)
        ["instruction", "saisi_juge", "audience_programmée", "poursuite"].includes(c.status)
      )
      .map((c) => ({
        id: c.id,
        reference: c.trackingCode || `RP-${c.id}/26`,
        title: c.provisionalOffence || "Information Judiciaire ouverte",
        status: c.status,
        plaintiff: c.citizen ? `${c.citizen.lastname} ${c.citizen.firstname}` : "Ministère Public",
        date: new Date(c.filedAt).toLocaleDateString("fr-FR")
      }));
  }, [rawCases]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'instruction': 
        return { bg: JUDGE_ACCENT + '15', text: JUDGE_ACCENT, label: 'INSTRUCTION' };
      case 'audience_programmée': 
        return { bg: "#DCFCE7", text: "#166534", label: 'AU RÔLE' };
      case 'saisi_juge':
        return { bg: "#FEE2E2", text: "#991B1B", label: 'NOUVEAU' };
      default: 
        return { bg: colors.bgMain, text: colors.textSub, label: 'EN ATTENTE' };
    }
  };

  const renderItem = ({ item }: { item: CaseData }) => {
    const statusStyle = getStatusStyle(item.status);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        // ✅ Navigation vers le détail harmonisé
        onPress={() => navigation.navigate("JudgeCaseDetail", { caseId: item.id })} 
      >
        <View style={styles.header}>
          <Text style={[styles.ref, { color: JUDGE_ACCENT }]}>{item.reference}</Text>
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

      {/* 🏛️ BANDEAU DU MAGISTRAT */}
      <View style={[styles.banner, { backgroundColor: colors.bannerBg, borderBottomColor: colors.border }]}>
          <View style={styles.row}>
            <View style={[styles.ribbonIcon, { backgroundColor: JUDGE_ACCENT + '15' }]}>
                <Ionicons name="ribbon" size={16} color={JUDGE_ACCENT} />
            </View>
            <Text style={[styles.bannerText, { color: colors.textSub }]}>
              Magistrat : <Text style={[styles.boldText, { color: colors.textMain }]}>{user?.lastname?.toUpperCase()}</Text>
            </Text>
          </View>
          <Text style={[styles.caseCount, { color: JUDGE_ACCENT }]}>{cases.length} Dossier(s)</Text>
      </View>
      
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {isLoading && !isRefetching ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={JUDGE_ACCENT} />
                <Text style={[styles.loadingText, { color: colors.textSub }]}>SYNCHRONISATION DU CABINET...</Text>
            </View>
        ) : (
            <FlatList
              data={cases}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={JUDGE_ACCENT} />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                    <Ionicons name="folder-open-outline" size={80} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Registre Vide</Text>
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>
                      Aucun dossier n'est actuellement affecté à votre cabinet d'instruction.
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
  listContainer: { padding: 18, paddingBottom: 150 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  banner: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  row: { flexDirection: "row", alignItems: "center" },
  ribbonIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  bannerText: { fontSize: 13, fontWeight: '600' },
  boldText: { fontWeight: '900' },
  caseCount: { fontSize: 11, fontWeight: '900' },
  card: { 
    padding: 22, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, alignItems: 'center' },
  ref: { fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 20, lineHeight: 26, letterSpacing: -0.5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 16, marginTop: 5 },
  infoText: { fontSize: 12, marginLeft: 8, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 15 },
  emptyText: { marginTop: 10, textAlign: 'center', fontSize: 14, lineHeight: 22, fontWeight: '600' },
});