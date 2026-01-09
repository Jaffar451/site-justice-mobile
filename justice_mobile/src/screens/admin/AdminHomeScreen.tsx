import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from "@tanstack/react-query"; 
import { useFocusEffect } from "@react-navigation/native";

// ✅ Architecture & Thème
import { AdminScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import api from "../../services/api"; 
import { getAdminStats } from "../../services/stats.service"; // ✅ Basé sur votre structure service

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// --- SERVICE API PROFIL ---
const fetchUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data || response.data;
};

export default function AdminHomeScreen({ navigation }: AdminScreenProps<'AdminHome'>) {
  const { isDark, theme } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user: storeUser, setUser } = useAuthStore(); 
  const [now, setNow] = useState(new Date());

  // ✅ 1. Synchronisation Profil
  const { data: apiUser } = useQuery({
    queryKey: ['me'],
    queryFn: fetchUserProfile,
  });

  useEffect(() => {
    if (apiUser && apiUser.id !== storeUser?.id) {
      setUser(apiUser);
    }
  }, [apiUser]);

  const userData = apiUser || storeUser;

  // ✅ 2. Récupération des Statistiques Globales
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: getAdminStats,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => now.toLocaleDateString('fr-FR', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).toUpperCase(), [now]);

  const formattedTime = useMemo(() => now.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }), [now]);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
  };

  const menuItems = [
    { title: "Comptes & Rôles", sub: "Habilitations et accès RH", icon: "people-circle-outline", route: "AdminUsers", color: "#6366F1" },
    { title: "Unités de Sécurité", sub: "Gendarmeries et Commissariats", icon: "shield-half-outline", route: "ManageStations", color: "#2563EB" },
    { title: "Cours et Tribunaux", sub: "Juridictions et Greffes", icon: "business-outline", route: "AdminCourts", color: "#059669" },
    { title: "Carte du Maillage", sub: "Déploiement territorial", icon: "map-outline", route: "NationalMap", color: "#0891B2" },
    { title: "Audit & Sécurité", sub: "Traçabilité des actes judiciaires", icon: "finger-print-outline", route: "AdminLogs", color: "#475569" },
  ];

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Supervision MJ Niger" showMenu={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={statsLoading} onRefresh={refetch} tintColor={primaryColor} />
        }
      >
        {/* 👋 ENTÊTE BIENVENUE */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>
            Bonjour, {(userData?.firstname || "Administrateur").toUpperCase()}
          </Text>
          <Text style={[styles.welcomeSub, { color: colors.textSub }]}>Système Central e-Justice Niger</Text>
        </View>

        {/* 🕒 CLOCK WIDGET */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#1E293B', '#334155']}
          style={styles.clockWidget}
        >
          <View style={styles.clockHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SERVEUR CENTRAL : OPÉRATIONNEL</Text>
          </View>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </LinearGradient>

        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Monitoring du Réseau National</Text>
        
        {/* STATS GRID DYNAMIQUE */}
        <View style={styles.statsGrid}>
          <StatMiniCard icon="people" val={stats?.usersCount || "---"} label="Utilisateurs" color="#6366F1" colors={colors} />
          <StatMiniCard icon="business" val={stats?.courtsCount || "---"} label="Juridictions" color="#8B5CF6" colors={colors} />
          <StatMiniCard icon="bar-chart" val={stats?.activityRate || "94%"} label="Flux Actif" color="#EC4899" colors={colors} />
          <StatMiniCard icon="pulse" val={stats?.systemStatus || "Stable"} label="État Système" color="#10B981" colors={colors} />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30, color: colors.textSub }]}>Unités de Gestion MJ</Text>

        {/* MENU LIST */}
        <View style={styles.menuList}>
          {menuItems.map((item, i) => (
            <Pressable 
              key={i} 
              onPress={() => navigation.navigate(item.route as any)}
              style={({ pressed }) => [
                styles.menuCard, 
                { 
                  opacity: pressed ? 0.7 : 1, 
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color + "12" }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[styles.menuSub, { color: colors.textSub }]}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
            </Pressable>
          ))}
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const StatMiniCard = ({ icon, val, label, color, colors }: any) => (
  <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
    <View style={[styles.statIconBox, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.statValue, { color: colors.textMain }]}>{val}</Text>
      <Text style={[styles.statLabel, { color: colors.textSub }]}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 10 },
  welcomeSection: { marginBottom: 20 },
  welcomeTitle: { fontSize: 22, fontWeight: "900" },
  welcomeSub: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  
  clockWidget: {
    padding: 24, borderRadius: 28, marginBottom: 25, alignItems: 'center',
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 15 },
        android: { elevation: 8 }
    })
  },
  clockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  statusText: { color: '#10B981', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  timeText: { fontSize: 38, fontWeight: "900", color: "#FFF", fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  dateText: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.6)", marginTop: 8, letterSpacing: 1.5 },

  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.2, textTransform: 'uppercase', marginLeft: 4 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48.5%', padding: 16, borderRadius: 22, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { fontSize: 9, fontWeight: "800" },
  
  menuList: { gap: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1 },
  iconCircle: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 15 },
  menuTitle: { fontSize: 15, fontWeight: "800" },
  menuSub: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  
  footerSpacing: { height: 140 },
});