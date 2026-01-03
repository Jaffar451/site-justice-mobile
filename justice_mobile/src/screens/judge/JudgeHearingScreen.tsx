import React, { useState, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

// ✅ 1. Imports Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getAllHearings } from "../../services/hearing.service";

interface Hearing {
  id: number;
  caseId: number;
  date: string;
  room: string;
  type: "preliminary" | "trial" | "verdict";
  trackingCode?: string;
  parties?: string; 
}

export default function JudgeHearingScreen({ navigation }: JudgeScreenProps<'JudgeCalendar'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const { user } = useAuthStore(); 
  const [filter, setFilter] = useState<"today" | "upcoming">("today");

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    segmentBg: isDark ? "#1E293B" : "#E2E8F0",
    segmentActive: isDark ? "#334155" : "#FFFFFF",
    dateBox: isDark ? "#0F172A" : "#F8FAFC",
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["judge-hearings"],
    queryFn: getAllHearings,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (data as Hearing[])
      .filter(h => {
        const hDate = new Date(h.date);
        hDate.setHours(0, 0, 0, 0);
        if (filter === "today") return hDate.getTime() === today.getTime();
        if (filter === "upcoming") return hDate.getTime() > today.getTime();
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, filter]);

  const renderItem = ({ item }: { item: Hearing }) => {
    const dateObj = new Date(item.date);
    const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
    const dayStr = dateObj.getDate();
    const monthStr = dateObj.toLocaleString("fr-FR", { month: "short" }).replace('.', '').toUpperCase();

    const typeStyles = {
        verdict: { color: "#EF4444", label: "DÉLIBÉRÉ", icon: "hammer-outline" },
        trial: { color: primaryColor, label: "PROCÈS", icon: "people-outline" },
        preliminary: { color: "#F59E0B", label: "INSTRUCTION", icon: "document-text-outline" }
    };
    const currentType = typeStyles[item.type] || typeStyles.preliminary;

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        onPress={() => navigation.navigate("JudgeCaseDetail", { caseId: item.caseId })}
      >
        <View style={[styles.dateBox, { backgroundColor: colors.dateBox }]}>
          <Text style={[styles.dateDay, { color: primaryColor }]}>{dayStr}</Text>
          <Text style={[styles.dateMonth, { color: colors.textSub }]}>{monthStr}</Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.rowBetween}>
            <Text style={[styles.caseId, { color: colors.textMain }]}>RG #{item.caseId}</Text>
            <View style={[styles.badge, { backgroundColor: currentType.color + "15" }]}>
              <Text style={[styles.badgeText, { color: currentType.color }]}>{currentType.label}</Text>
            </View>
          </View>
          
          <Text style={[styles.partiesText, { color: colors.textSub }]} numberOfLines={1}>
             {item.parties || "Ministère Public C/ Inconnu"}
          </Text>

          <View style={styles.rowDetail}>
            <View style={[styles.detailItem, { backgroundColor: colors.dateBox }]}>
                 <Ionicons name="time-outline" size={12} color={colors.textSub} />
                 <Text style={[styles.detailText, { color: colors.textSub }]}>{timeStr}</Text>
            </View>
            <View style={[styles.detailItem, { backgroundColor: colors.dateBox, marginLeft: 8 }]}>
                 <Ionicons name="location-outline" size={12} color={colors.textSub} />
                 <Text style={[styles.detailText, { color: colors.textSub }]}>Salle {item.room}</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Rôle d'Audience" showMenu={true} />

      {/* 🏛️ BANDEAU DU CABINET */}
      <View style={[styles.cabinetBanner, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.cabinetTitle, { color: colors.textMain }]}>
                CABINET DU JUGE {user?.lastname?.toUpperCase()}
            </Text>
            <Text style={[styles.cabinetSub, { color: colors.textSub }]}>
                Tribunal de Grande Instance
            </Text>
          </View>
          <Ionicons name="calendar-clear-outline" size={24} color={primaryColor} />
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {/* 📑 SELECTEUR SEGMENTÉ */}
        <View style={[styles.filterContainer, { backgroundColor: colors.segmentBg }]}>
            <TouchableOpacity 
            style={[styles.filterBtn, filter === "today" && { backgroundColor: colors.segmentActive }]}
            onPress={() => setFilter("today")}
            >
            <Text style={[styles.filterText, { color: filter === "today" ? primaryColor : colors.textSub }]}>
                AUJOURD'HUI
            </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            style={[styles.filterBtn, filter === "upcoming" && { backgroundColor: colors.segmentActive }]}
            onPress={() => setFilter("upcoming")}
            >
            <Text style={[styles.filterText, { color: filter === "upcoming" ? primaryColor : colors.textSub }]}>
                À VENIR
            </Text>
            </TouchableOpacity>
        </View>

        {isLoading ? (
            <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            </View>
        ) : (
            <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Aucune audience</Text>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>
                    {filter === "today" ? "Rien au rôle ce jour." : "Aucune audience programmée."}
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
  cabinetBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1 },
  cabinetTitle: { fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  cabinetSub: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  
  filterContainer: { flexDirection: "row", padding: 4, marginHorizontal: 20, marginTop: 20, borderRadius: 12, height: 48 },
  filterBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  filterText: { fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  
  listContent: { padding: 20, paddingBottom: 140 },
  card: { flexDirection: "row", padding: 14, borderRadius: 22, marginBottom: 15, borderWidth: 1, elevation: 2 },
  dateBox: { width: 58, height: 68, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 15 },
  dateDay: { fontSize: 24, fontWeight: "900" },
  dateMonth: { fontSize: 10, fontWeight: "900", marginTop: -4 },
  
  infoBox: { flex: 1, justifyContent: "center", marginRight: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  caseId: { fontWeight: "900", fontSize: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  
  partiesText: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  
  rowDetail: { flexDirection: "row", alignItems: "center" },
  detailItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailText: { fontSize: 11, fontWeight: "800", marginLeft: 4 },
  
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 15 },
  emptyText: { textAlign: 'center', fontSize: 14, fontWeight: '500', marginTop: 8 }
});