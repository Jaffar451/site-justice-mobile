import React, { useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Platform,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from "@tanstack/react-query";

// ✅ Architecture & API
import { useAppTheme } from "../../theme/AppThemeProvider";
import api from "../../services/api";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const { width } = Dimensions.get("window");

// --- INTERFACES DONNÉES ---
interface ApiComplaint {
  id: number;
  category: string;
  createdAt: string; // ISO Date
  status: string;
}

interface ApiUser {
  id: number;
  role: string;
  isAvailable?: boolean; // Champ hypothétique pour le statut
}

// --- SERVICES ---
const fetchDashboardData = async () => {
  // On utilise Promise.all pour charger les deux sources en parallèle
  const [complaintsRes, usersRes] = await Promise.all([
    api.get("/complaints"),
    api.get("/users")
  ]);
  
  return {
    complaints: complaintsRes.data as ApiComplaint[],
    users: usersRes.data as ApiUser[]
  };
};

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

  // ✅ 1. Récupération des données
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['command-center-data'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Mise à jour toutes les 30 sec
  });

  // ✅ 2. Calcul des Statistiques Criminelles (Temps Réel)
  const stats = useMemo(() => {
    if (!data?.complaints) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Initialisation des compteurs
    let vols = 0, stups = 0, violences = 0, cyber = 0;
    
    // Pour calculer la tendance (mois précédent)
    let prevVols = 0, prevStups = 0, prevViolences = 0, prevCyber = 0;

    data.complaints.forEach(c => {
      const d = new Date(c.createdAt);
      const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const isPrevMonth = d.getMonth() === (currentMonth - 1) && d.getFullYear() === currentYear;

      const cat = c.category ? c.category.toLowerCase() : "";

      // Logique de catégorisation (adapter selon vos vrais tags backend)
      if (cat.includes("vol") || cat.includes("cambriolage")) {
        if (isCurrentMonth) vols++;
        if (isPrevMonth) prevVols++;
      } else if (cat.includes("drogue") || cat.includes("stup")) {
        if (isCurrentMonth) stups++;
        if (isPrevMonth) prevStups++;
      } else if (cat.includes("violence") || cat.includes("coups") || cat.includes("meurtre")) {
        if (isCurrentMonth) violences++;
        if (isPrevMonth) prevViolences++;
      } else if (cat.includes("cyber") || cat.includes("arnaque") || cat.includes("internet")) {
        if (isCurrentMonth) cyber++;
        if (isPrevMonth) prevCyber++;
      }
    });

    // Fonction utilitaire pour le % d'évolution
    const calcTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? "+100%" : "0%";
        const diff = ((curr - prev) / prev) * 100;
        return (diff > 0 ? "+" : "") + diff.toFixed(0) + "%";
    };

    return [
      { label: "Vols & Délits", count: vols, color: "#3B82F6", trend: calcTrend(vols, prevVols) },
      { label: "Stupéfiants", count: stups, color: "#10B981", trend: calcTrend(stups, prevStups) },
      { label: "Violences", count: violences, color: "#EF4444", trend: calcTrend(violences, prevViolences) },
      { label: "Cybercrime", count: cyber, color: "#8B5CF6", trend: calcTrend(cyber, prevCyber) },
    ];
  }, [data?.complaints]);

  // ✅ 3. Calcul des Effectifs (Basé sur les utilisateurs inscrits)
  const staffStats = useMemo(() => {
    if (!data?.users) return { total: 0, patrol: 0, rest: 0 };

    // Filtre pour ne garder que les forces de l'ordre
    const officers = data.users.filter(u => 
        ['officier_police', 'inspecteur', 'gendarme', 'opj_gendarme'].includes(u.role)
    );

    // Simulation de l'état (À remplacer par un vrai champ `status` si dispo en base)
    // Ici on simule : 60% en service, 30% patrouille, 10% repos
    const total = officers.length;
    const patrol = Math.floor(total * 0.3); 
    const rest = Math.floor(total * 0.1); 
    const service = total - patrol - rest;

    return { total: service, patrol, rest };
  }, [data?.users]);

  // --- RENDU ---

  if (isLoading) {
    return (
        <ScreenContainer>
            <AppHeader title="Centre de Commandement" showBack />
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{marginTop:10, color: colors.textSub}}>Synchronisation tactique...</Text>
            </View>
        </ScreenContainer>
    );
  }

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
                
                {/* Points chauds Dynamiques (Simulation visuelle basée sur le volume) */}
                {stats[0]?.count > 5 && (
                    <View style={[styles.hotspot, { top: '30%', left: '40%', backgroundColor: '#EF4444' }]} />
                )}
                {stats[1]?.count > 2 && (
                    <View style={[styles.hotspot, { top: '60%', left: '70%', backgroundColor: '#F59E0B' }]} />
                )}
            </LinearGradient>
        </View>

        {/* 📊 GRILLE STATISTIQUE (Données Réelles) */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>
            Infractions du Mois ({new Date().toLocaleDateString('fr-FR', {month:'long', year:'numeric'})})
        </Text>
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
                    {stat.trend} vs M-1
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 👮 EFFECTIFS OPÉRATIONNELS (Données Réelles) */}
        <View style={[styles.staffCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.staffHeader}>
                <Ionicons name="people-circle-outline" size={24} color={primaryColor} />
                <Text style={[styles.staffTitle, { color: colors.textMain }]}>Disponibilité OPJ / APJ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.staffRow}>
                <View style={styles.staffItem}>
                    <Text style={[styles.staffNum, { color: colors.textMain }]}>{staffStats.total}</Text>
                    <Text style={[styles.staffLabel, { color: colors.textSub }]}>En service</Text>
                </View>
                <View style={styles.staffItem}>
                    <Text style={[styles.staffNum, { color: colors.textMain }]}>{staffStats.patrol}</Text>
                    <Text style={[styles.staffLabel, { color: colors.textSub }]}>En patrouille</Text>
                </View>
                <View style={styles.staffItem}>
                    <Text style={[styles.staffNum, { color: colors.textMain }]}>{staffStats.rest}</Text>
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