import React, { useMemo, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Platform,
  RefreshControl
} from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
// 👇 AJOUT DE L'IMPORT DU FOOTER
import SmartFooter from "../../components/layout/SmartFooter"; 
import { useAppTheme } from "../../theme/AppThemeProvider";
import { getAdminStats } from "../../services/admin.service";

const { width } = Dimensions.get('window');

// 🛠️ COMPOSANT ALTERNATIF POUR LE WEB 
const WebProgressBar = ({ label, value, total, color }: any) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#1E293B' }}>{value}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color }} />
      </View>
    </View>
  );
};

export default function AdminStatsScreen({ navigation }: any) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const [refreshing, setRefreshing] = useState(false);

  // 1. 📡 Récupération Réelle des Données
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: getAdminStats,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // 🎨 Palette
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  // 2. Préparation des Données
  const pieData = useMemo(() => {
    if (!stats?.statusStats || stats.statusStats.length === 0) {
        return [{ value: 1, color: '#E2E8F0', text: '', label: 'Aucune donnée' }];
    }
    const palette = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
    return stats.statusStats.map((item: any, index: number) => ({
      value: parseInt(item.count) || 0,
      color: palette[index % palette.length],
      text: `${item.count}`,
      label: item.status
    }));
  }, [stats]);

  const barData = useMemo(() => {
    if (!stats?.regionalStats || stats.regionalStats.length === 0) {
        return [{ value: 0, label: 'N/A', frontColor: '#E2E8F0' }];
    }
    return stats.regionalStats.map((item: any) => ({
      value: parseInt(item.total) || 0,
      label: item.district?.substring(0, 3).toUpperCase() || 'UNK', 
      frontColor: primaryColor,
      topLabelComponent: () => (
        <Text style={{ color: colors.textSub, fontSize: 10, marginBottom: 4 }}>
          {item.total}
        </Text>
      )
    }));
  }, [stats, primaryColor]);

  const totalComplaints = stats?.summary?.complaints_total || 0;
  const totalUsers = stats?.summary?.users_total || 0;
  const totalLogs = stats?.summary?.logs_total || 0;

  // --- COMPOSANTS INTERNES ---
  const LegendItem = ({ color, label, value }: any) => (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: colors.textSub }]}>{label}</Text>
      <Text style={[styles.legendValue, { color: colors.textMain }]}>{value}</Text>
    </View>
  );

  const renderPieChartSection = () => {
    if (Platform.OS === 'web') {
        return (
            <View style={{ paddingVertical: 10 }}>
                {pieData.map((item: any, i: number) => (
                    <WebProgressBar 
                        key={i} 
                        label={item.label || 'Autre'} 
                        value={item.value} 
                        total={totalComplaints || 1}
                        color={item.color} 
                    />
                ))}
            </View>
        );
    }
    return (
        <View style={styles.pieContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <PieChart
                    data={pieData}
                    donut
                    radius={80}
                    innerRadius={60}
                    centerLabelComponent={() => (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textMain }}>
                                {totalComplaints}
                            </Text>
                            <Text style={{ fontSize: 10, color: colors.textSub }}>Total</Text>
                        </View>
                    )}
                />
            </View>
            <View style={styles.legendContainer}>
                {pieData.map((item: any, i: number) => (
                    item.label ? <LegendItem key={i} color={item.color} label={item.label} value={item.value} /> : null
                ))}
            </View>
        </View>
    );
  };

  const renderBarChartSection = () => {
    if (Platform.OS === 'web') {
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
               {barData.map((item: any, i: number) => (
                 <View key={i} style={{ padding: 10, backgroundColor: colors.bgMain, borderRadius: 8, minWidth: '45%', flex: 1 }}>
                    <Text style={{ color: primaryColor, fontWeight: '900', fontSize: 16 }}>{item.value}</Text>
                    <Text style={{ color: colors.textSub, fontSize: 12 }}>{item.label}</Text>
                 </View>
               ))}
            </View>
        );
    }
    return (
        <View style={[styles.chartWrapper, { marginTop: 20 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
                data={barData}
                barWidth={30}
                spacing={20}
                roundedTop
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: colors.textSub, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.textSub, fontSize: 10 }}
                hideRules
                noOfSections={4}
                maxValue={Math.max(...barData.map((d:any) => d.value), 10) + 5}
                width={width - 80}
            />
            </ScrollView>
        </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Analyses & Statistiques" showBack />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. ÉTAT DES DOSSIERS */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="pie-chart-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>État des Dossiers</Text>
          </View>
          {renderPieChartSection()}
        </View>

        {/* 2. UNITÉS PAR RÉGION */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Unités par Région</Text>
          </View>
          {renderBarChartSection()}
        </View>

        {/* 3. KPI SECONDAIRES */}
        <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Text style={[styles.kpiLabel, { color: colors.textSub }]}>Utilisateurs</Text>
                <Text style={[styles.kpiValue, { color: primaryColor }]}>{totalUsers}</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Text style={[styles.kpiLabel, { color: colors.textSub }]}>Logs (Global)</Text>
                <Text style={[styles.kpiValue, { color: "#F59E0B" }]}>{totalLogs}</Text>
            </View>
        </View>

        {/* Espace pour éviter que le footer ne cache le contenu */}
        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* 👇 LE FOOTER EST ICI */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  card: {
    borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
        android: { elevation: 3 }
    })
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  
  pieContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  legendContainer: { flex: 1, marginLeft: 20, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, fontWeight: "600", flex: 1 },
  legendValue: { fontSize: 12, fontWeight: "800" },

  chartWrapper: { alignItems: 'center', justifyContent: 'center' },

  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  kpiLabel: { fontSize: 12, fontWeight: "700", textTransform: 'uppercase', marginBottom: 5 },
  kpiValue: { fontSize: 24, fontWeight: "900" },

  // 👇 Espace vital pour le footer
  footerSpacing: { height: 100 },
});