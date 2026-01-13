import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  Pressable,
  Platform, // ✅ Indispensable
  RefreshControl,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from "@tanstack/react-query"; 
import { useFocusEffect } from "@react-navigation/native";
import * as LocalAuthentication from 'expo-local-authentication'; 
import * as Haptics from 'expo-haptics'; 

// ✅ Architecture
import { AdminScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import api from "../../services/api"; 
import { getAdminStats } from "../../services/stats.service";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";
import AnimatedCounter from "../../components/ui/AnimatedCounter"; 
import DashboardSkeleton from "../../components/ui/DashboardSkeleton"; 

// --- SERVICE API ---
const fetchUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data || response.data;
};

// 🕒 COMPOSANT HORLOGE ISOLÉ
const ClockWidget = React.memo(({ isDark, systemStatus }: { isDark: boolean, systemStatus: string }) => {
  const [now, setNow] = useState(new Date());

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

  return (
    <LinearGradient
      colors={isDark ? ['#1E293B', '#0F172A'] : ['#1E293B', '#334155']}
      style={styles.clockWidget}
    >
      <View style={styles.clockHeader}>
        <View style={[styles.statusDot, { backgroundColor: systemStatus === 'Maintenance' ? '#EF4444' : '#10B981' }]} />
        <Text style={[styles.statusText, { color: systemStatus === 'Maintenance' ? '#EF4444' : '#10B981' }]}>
            {systemStatus === 'Maintenance' ? 'MODE MAINTENANCE' : 'SERVEUR CENTRAL : OPÉRATIONNEL'}
        </Text>
      </View>
      <Text style={styles.timeText}>{formattedTime}</Text>
      <Text style={styles.dateText}>{formattedDate}</Text>
    </LinearGradient>
  );
});

export default function AdminHomeScreen({ navigation }: AdminScreenProps<'AdminHome'>) {
  const { isDark, theme } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user: storeUser, setUser } = useAuthStore(); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  // ✅ 1. SÉCURITÉ BIOMÉTRIQUE (Optimisée Web)
  useEffect(() => {
    const checkBiometrics = async () => {
      // 🌍 Sur Web, on bypass la biométrie car non supportée
      if (Platform.OS === 'web') {
          setIsAuthenticated(true);
          return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Accès Administrateur Sécurisé',
          fallbackLabel: 'Utiliser le code PIN',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setIsAuthenticated(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert("Accès Refusé", "Authentification requise.", [
            { text: "Réessayer", onPress: checkBiometrics },
            { text: "Quitter", onPress: () => navigation.goBack() } 
          ]);
        }
      } else {
        setIsAuthenticated(true);
      }
    };

    checkBiometrics();
  }, []);

  // ✅ 2. SYNC PROFIL
  const { data: apiUser } = useQuery({
    queryKey: ['me'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, 
  });

  useEffect(() => {
    if (apiUser && apiUser.id !== storeUser?.id) {
      setUser(apiUser);
    }
  }, [apiUser]);

  const userData = apiUser || storeUser;

  // ✅ 3. STATS
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: getAdminStats,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  const menuItems = [
    { title: "Comptes & Rôles", sub: "Habilitations et accès RH", icon: "people-circle-outline", route: "AdminUsers", color: "#6366F1" },
    { title: "Unités de Sécurité", sub: "Gendarmeries et Commissariats", icon: "shield-half-outline", route: "ManageStations", color: "#2563EB" },
    { title: "Cours et Tribunaux", sub: "Juridictions et Greffes", icon: "business-outline", route: "AdminCourts", color: "#059669" },
    { title: "Carte du Maillage", sub: "Déploiement territorial", icon: "map-outline", route: "NationalMap", color: "#0891B2" },
    { title: "Audit & Sécurité", sub: "Traçabilité des actes", icon: "finger-print-outline", route: "AdminAudit", color: "#475569" },
    { title: "Maintenance Système", sub: "Cache, Logs & Santé", icon: "construct-outline", route: "AdminMaintenance", color: "#EF4444" },
    { title: "Scanner de Contrôle", sub: "Vérifier Badges & Actes", icon: "qr-code-outline", route: "VerificationScanner", color: "#F59E0B" },
    { title: "Rapports Hebdo", sub: "Statistiques d'activité", icon: "stats-chart-outline", route: "WeeklyReport", color: "#8B5CF6" },
  ];

  if (!isAuthenticated) {
    return (
      <ScreenContainer withPadding={false}>
         <View style={{flex:1, backgroundColor: colors.bgMain}} /> 
      </ScreenContainer>
    );
  }

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
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>
            Bonjour, {(userData?.firstname || "Administrateur").toUpperCase()}
          </Text>
          <Text style={[styles.welcomeSub, { color: colors.textSub }]}>Système Central e-Justice Niger</Text>
        </View>

        <ClockWidget isDark={isDark} systemStatus={stats?.systemStatus || 'Stable'} />

        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Monitoring du Réseau National</Text>
        
        {statsLoading && !stats ? (
           <DashboardSkeleton />
        ) : (
          <View style={styles.statsGrid}>
            <StatMiniCard icon="people" val={stats?.usersCount || 0} label="Utilisateurs" color="#6366F1" colors={colors} />
            <StatMiniCard icon="business" val={stats?.courtsCount || 0} label="Juridictions" color="#8B5CF6" colors={colors} />
            <StatMiniCard icon="bar-chart" val={stats?.activityRate || "0%"} label="Flux Actif" color="#EC4899" colors={colors} />
            <StatMiniCard icon="pulse" val={stats?.systemStatus || "Stable"} label="État Système" color="#10B981" colors={colors} />
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 30, color: colors.textSub }]}>Gestion & Outils Techniques</Text>

        <View style={styles.menuList}>
          {menuItems.map((item, i) => (
            <Pressable 
              key={i} 
              onPress={() => {
                // ✅ CORRECTION DU CRASH WEB ICI
                if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                }
                navigation.navigate(item.route as any);
              }}
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

// 🔢 CARTE AVEC ANIMATION
const StatMiniCard = ({ icon, val, label, color, colors }: any) => (
  <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
    <View style={[styles.statIconBox, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <AnimatedCounter 
        value={val} 
        style={[styles.statValue, { color: colors.textMain }]} 
        duration={1200} 
      />
      <Text style={[styles.statLabel, { color: colors.textSub }]}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 20 },
  welcomeSection: { marginBottom: 25 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  welcomeSub: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  
  clockWidget: {
    padding: 24, borderRadius: 28, marginBottom: 30, alignItems: 'center',
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
        android: { elevation: 10 }
    })
  },
  clockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  timeText: { fontSize: 42, fontWeight: "900", color: "#FFF", fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: -1 },
  dateText: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.7)", marginTop: 8, letterSpacing: 1.5 },

  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.2, textTransform: 'uppercase', marginLeft: 4 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 16, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { fontSize: 9, fontWeight: "800", textTransform: 'uppercase' },
  
  menuList: { gap: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1 },
  iconCircle: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 15 },
  menuTitle: { fontSize: 15, fontWeight: "800" },
  menuSub: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  
  footerSpacing: { height: 140 },
});