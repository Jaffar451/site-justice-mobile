import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const { width } = Dimensions.get("window");

export default function CommissaireCommandCenter() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  // Simulation des données de criminalité (Janvier 2026)
  const stats = [
    { label: "Vols", count: 28, color: "#3B82F6", trend: "+5%" },
    { label: "Stupéfiants", count: 12, color: "#10B981", trend: "-2%" },
    { label: "Violences", count: 0, color: "#EF4444", trend: "0%" },
    { label: "Cybercrime", count: 8, color: "#8B5CF6", trend: "+12%" },
  ];

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Centre de Commandement" showBack />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 🗺️ RÉSUMÉ GÉOGRAPHIQUE */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Cartographie Opérationnelle</Text>
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <LinearGradient 
                colors={[isDark ? "#1E293B" : "#E2E8F0", isDark ? "#0F172A" : "#F1F5F9"]} 
                style={styles.mapSimulation}
            >
                <Ionicons name="map-outline" size={50} color={colors.textSub} style={{ opacity: 0.3 }} />
                <Text style={[styles.mapText, { color: colors.textSub }]}>Vue Satellite Niamey Sectorielle</Text>
                
                {/* Points chauds simulés */}
                <View style={[styles.hotspot, { top: '30%', left: '40%', backgroundColor: '#EF4444' }]} />
                <View style={[styles.hotspot, { top: '60%', left: '70%', backgroundColor: '#F59E0B' }]} />
            </LinearGradient>
        </View>

        {/* 📊 GRILLE STATISTIQUE */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Infractions du Mois (Janvier 2026)</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
                <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textMain }]}>{stat.label}</Text>
              <View style={styles.trendRow}>
                <Ionicons 
                    name={stat.trend.includes('+') ? "trending-up" : "trending-down"} 
                    size={12} 
                    color={stat.trend.includes('+') ? "#EF4444" : "#10B981"} 
                />
                <Text style={[styles.trendText, { color: stat.trend.includes('+') ? "#EF4444" : "#10B981" }]}>
                    {stat.trend}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 👮 EFFECTIFS OPÉRATIONNELS */}
        <View style={[styles.staffCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.staffHeader}>
                <Ionicons name="people-circle-outline" size={24} color={primaryColor} />
                <Text style={[styles.staffTitle, { color: colors.textMain }]}>Disponibilité OPJ / APJ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.staffRow}>
                <View style={styles.staffItem}>
                    <Text style={[styles.staffNum, { color: colors.textMain }]}>14</Text>
                    <Text style={[styles.staffLabel, { color: colors.textSub }]}>En service</Text>
                </View>
                <View style={styles.staffItem}>
                    <Text style={[styles.staffNum, { color: colors.textMain }]}>06</Text>
                    <Text style={[styles.staffLabel, { color: colors.textSub }]}>En patrouille</Text>
                </View>
                <View style={styles.staffItem}>
                    <Text style={[styles.staffNum, { color: colors.textMain }]}>02</Text>
                    <Text style={[styles.staffLabel, { color: colors.textSub }]}>Repos</Text>
                </View>
            </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  sectionTitle: { fontSize: 10, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginTop: 10 },
  
  mapPlaceholder: { height: 200, borderRadius: 28, borderWidth: 1, overflow: 'hidden', marginBottom: 25 },
  mapSimulation: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapText: { fontSize: 12, fontWeight: '700', marginTop: 10 },
  hotspot: { position: 'absolute', width: 20, height: 20, borderRadius: 10, opacity: 0.6, borderWidth: 4, borderColor: 'rgba(255,255,255,0.4)' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 25 },
  statCard: { width: (width - 44) / 2, padding: 20, borderRadius: 24, borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) },
  statIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statCount: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: 10, fontWeight: '900' },

  staffCard: { padding: 22, borderRadius: 28, borderWidth: 1 },
  staffHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  staffTitle: { fontSize: 16, fontWeight: '900' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 20 },
  staffRow: { flexDirection: 'row', justifyContent: 'space-between' },
  staffItem: { alignItems: 'center', flex: 1 },
  staffNum: { fontSize: 22, fontWeight: '900' },
  staffLabel: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' }
});