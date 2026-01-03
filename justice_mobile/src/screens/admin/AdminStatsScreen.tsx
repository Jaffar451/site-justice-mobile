import React, { useMemo } from "react";
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar,
  Platform,
  ViewStyle
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Layout
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import { getDashboardData } from "../../services/admin.service";

const screenWidth = Dimensions.get("window").width;
const isWeb = Platform.OS === 'web';

export default function AdminStatsScreen({ navigation }: any) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    chartBg: isDark ? "#1E293B" : "#FFFFFF",
  };

  // ✅ 1. CHARGEMENT DONNÉES
  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ["judicial-stats"],
    queryFn: getDashboardData,
    refetchInterval: 60000, // Refresh auto 1min
  });

  // ✅ 2. EXTRACTION SÉCURISÉE
  const stats = useMemo(() => {
    if (!rawData) return null;
    const data = (rawData as any).data || rawData;
    
    return {
        statusStats: data.statusStats || [],
        regionalStats: data.regionalStats || [],
        timingStats: data.timingStats || { avg_days: 0 }
    };
  }, [rawData]);

  const chartColors = ['#6366F1', '#E67E22', '#10B981', '#EF4444', '#8B5CF6'];

  // Calcul KPI Total
  const totalDossiers = useMemo(() => {
    if (!stats?.statusStats) return 0;
    return stats.statusStats.reduce((acc: number, s: any) => acc + (parseInt(s.count) || 0), 0);
  }, [stats]);

  /**
   * 🖥️ TABLEAU WEB (Format Desktop)
   */
  const WebDataTable = ({ items, labelKey, valueKey, title }: any) => (
    <View style={[styles.webTable, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.webTableTitle, { color: colors.textMain }]}>{title}</Text>
      {(items || []).map((item: any, index: number) => (
        <View key={index} style={[styles.webTableRow, { borderBottomColor: colors.border }]}>
          <View style={styles.webRowLabelGroup}>
              <View style={[styles.dot, { backgroundColor: chartColors[index % chartColors.length] }]} />
              <Text style={[styles.webLabelText, { color: colors.textSub }]}>{item[labelKey]}</Text>
          </View>
          <Text style={[styles.webValueText, { color: colors.textMain }]}>{item[valueKey]}</Text>
        </View>
      ))}
    </View>
  );

  if (isLoading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Analytique" showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    </ScreenContainer>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Supervision Nationale" showBack={true} />
      
      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
          showsVerticalScrollIndicator={false}
        >
          {/* 🏆 INDICATEURS CLÉS (KPI) */}
          <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { backgroundColor: colors.bgCard, borderLeftColor: primaryColor }]}>
                  <Ionicons name="documents-outline" size={22} color={primaryColor} />
                  <Text style={[styles.kpiValue, { color: colors.textMain }]}>{totalDossiers}</Text>
                  <Text style={[styles.kpiLabel, { color: colors.textSub }]}>Dossiers Actifs</Text>
              </View>
              <View style={[styles.kpiCard, { backgroundColor: colors.bgCard, borderLeftColor: "#E67E22" }]}>
                  <Ionicons name="speedometer-outline" size={22} color="#E67E22" />
                  <Text style={[styles.kpiValue, { color: colors.textMain }]}>{Math.round(stats?.timingStats?.avg_days || 0)}j</Text>
                  <Text style={[styles.kpiLabel, { color: colors.textSub }]}>Délai Moyen</Text>
              </View>
          </View>

          {/* 📊 GRAPHIQUES & DATA VISUALIZATION */}
          {isWeb ? (
            <View style={{ gap: 20 }}>
              <WebDataTable title="Répartition par Statut" items={stats?.statusStats} labelKey="status" valueKey="count" />
              <WebDataTable title="Activité par District Judiciaire" items={stats?.regionalStats} labelKey="district" valueKey="total" />
            </View>
          ) : (
            <View>
              {/* CAMEMBERT STATUTS */}
              <Text style={[styles.chartTitle, { color: colors.textSub }]}>Distribution des Procédures</Text>
              <View style={[styles.chartContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {(stats?.statusStats || []).length > 0 ? (
                    <PieChart
                        data={(stats?.statusStats || []).map((s: any, i: number) => ({
                            name: (s.status || "").replace(/_/g, ' '),
                            population: parseInt(s.count) || 0,
                            color: chartColors[i % chartColors.length],
                            legendFontColor: colors.textSub,
                            legendFontSize: 11
                        }))}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={{ 
                            color: (opacity = 1) => primaryColor,
                            labelColor: () => colors.textMain,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>Données insuffisantes</Text>
                )}
              </View>

              {/* BAR CHART REGIONS */}
              <Text style={[styles.chartTitle, { marginTop: 25, color: colors.textSub }]}>Activité des Districts (Top 5)</Text>
              <View style={[styles.chartContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                {(stats?.regionalStats || []).length > 0 ? (
                    <BarChart
                        data={{
                            labels: (stats?.regionalStats || []).slice(0, 5).map((r: any) => (r.district || "").substring(0, 5)),
                            datasets: [{ data: (stats?.regionalStats || []).slice(0, 5).map((r: any) => parseInt(r.total) || 0) }]
                        }}
                        width={screenWidth - 60}
                        height={240}
                        yAxisLabel=""
                        yAxisSuffix=""
                        fromZero
                        chartConfig={{
                            backgroundColor: colors.bgCard,
                            backgroundGradientFrom: colors.bgCard,
                            backgroundGradientTo: colors.bgCard,
                            color: (opacity = 1) => isDark ? `rgba(99, 102, 241, ${opacity})` : primaryColor,
                            labelColor: (opacity = 1) => colors.textSub,
                            barPercentage: 0.6,
                            decimalPlaces: 0,
                            style: { borderRadius: 16 }
                        }}
                        style={{ borderRadius: 16, marginTop: 10 }}
                    />
                ) : (
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucune donnée régionale</Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
      
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 10 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  kpiCard: { 
    flex: 1, padding: 20, borderRadius: 24, borderLeftWidth: 6,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  kpiValue: { fontSize: 24, fontWeight: '900', marginTop: 10 },
  kpiLabel: { fontSize: 10, fontWeight: '800', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 5 },
  chartContainer: { 
    borderRadius: 32, paddingVertical: 20, alignItems: 'center', marginBottom: 15,
    borderWidth: 1,
  },
  webTable: { borderRadius: 24, padding: 25, borderWidth: 1 },
  webTableTitle: { fontSize: 18, fontWeight: "900", marginBottom: 20 },
  webTableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1 },
  webRowLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  webLabelText: { fontSize: 14, fontWeight: "700" },
  webValueText: { fontSize: 15, fontWeight: "900" },
  emptyText: { margin: 30, fontStyle: "italic", fontWeight: "600" },
  footerSpacing: { height: 140 }
});