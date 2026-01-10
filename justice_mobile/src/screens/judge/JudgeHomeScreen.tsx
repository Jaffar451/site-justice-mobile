// PATH: src/screens/judge/JudgeHomeScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  StatusBar, 
  Alert, 
  Dimensions,
  Platform,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";

// ✅ Architecture & Theme
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";
import { getProsecutorStats } from "../../services/stats.service"; // On utilise les stats judiciaires globales

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const { width } = Dimensions.get("window");

export default function JudgeHomeScreen({ navigation }: JudgeScreenProps<'JudgeHome'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  // ✅ Identité Cabinet d'Instruction (Violet)
  const JUDGE_ACCENT = "#7C3AED"; 

  // 🕒 HORLOGE EN TEMPS RÉEL
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔄 RÉCUPÉRATION DES STATISTIQUES
  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["judge-stats"],
    queryFn: getProsecutorStats, 
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateFull = currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  const judicialTitle = user?.lastname 
    ? `M. le Juge ${user.lastname.toUpperCase()}` 
    : "Magistrat du Siège";

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Cabinet d'Instruction" showMenu={true} />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={JUDGE_ACCENT} />
        }
      >
        
        {/* 👋 1. BIENVENUE & HEURE */}
        <View style={styles.headerSection}>
          <View style={styles.welcomeInfo}>
            <Text style={[styles.welcomeSub, { color: colors.textSub }]}>{dateFull}</Text>
            <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>Bonjour, {user?.firstname}</Text>
            <Text style={[styles.rankText, { color: JUDGE_ACCENT }]}>{judicialTitle}</Text>
          </View>
          <LinearGradient 
            colors={[JUDGE_ACCENT, '#4C1D95']} 
            style={styles.clockBadge}
          >
            <Text style={styles.clockText}>{timeString}</Text>
          </LinearGradient>
        </View>

        {/* ⚖️ 2. BANDEAU DÉONTOLOGIE */}
        <View style={[styles.oathBanner, { backgroundColor: isDark ? "#1E293B" : "#F5F3FF", borderColor: isDark ? colors.border : "#DDD6FE" }]}>
           <Ionicons name="ribbon-outline" size={20} color={JUDGE_ACCENT} />
           <Text style={[styles.oathText, { color: colors.textSub }]}>Rigueur • Impartialité • Indépendance</Text>
        </View>

        {/* 📊 3. INDICATEURS DYNAMIQUES */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon="folder-open" 
            value={isLoading ? "..." : stats?.enCours?.toString() || "0"} 
            label="En Instruction" 
            color={JUDGE_ACCENT} 
            bgColor={isDark ? "#4C1D95" : "#F5F3FF"} 
            onPress={() => navigation.navigate("JudgeCaseList" as any)}
            colors={colors}
          />
          <StatCard 
            icon="calendar" 
            value="3" // À lier au service d'audience
            label="Audiences" 
            color="#10B981" 
            bgColor={isDark ? "#064E3B" : "#F0FDF4"} 
            onPress={() => navigation.navigate("JudgeHearing" as any)}
            colors={colors}
          />
          <StatCard 
            icon="alert-circle" 
            value={isLoading ? "..." : stats?.urgences?.toString() || "0"} 
            label="Urgences" 
            color="#EF4444" 
            bgColor={isDark ? "#7F1D1D" : "#FFF5F5"} 
            onPress={() => navigation.navigate("JudgeCaseList" as any)}
            colors={colors}
          />
        </View>

        {/* 📂 4. PILOTAGE JUDICIAIRE */}
        <Text style={[styles.sectionHeader, { color: colors.textSub }]}>Pilotage du Cabinet</Text>
        
        <ActionCard 
          icon="file-tray-full" 
          title="Registre des Dossiers" 
          desc="Consultation, instruction et ordonnances."
          color={JUDGE_ACCENT}
          colors={colors}
          onPress={() => navigation.navigate("JudgeCaseList" as any)}
        />

        <ActionCard 
          icon="hammer" 
          title="Rendre une Décision" 
          desc="Saisir un verdict, un non-lieu ou une relaxe."
          color="#10B981"
          colors={colors}
          onPress={() => navigation.navigate("JudgeDecisions" as any)} // Vers l'historique des décisions
        />

        {/* 🛠️ 5. OUTILS PROFESSIONNELS */}
        <Text style={[styles.sectionHeader, { color: colors.textSub }]}>Outils du Quotidien</Text>
        <View style={styles.toolsRow}>
            <ToolBtn 
                icon="calendar-outline" 
                label="Calendrier" 
                color={JUDGE_ACCENT} 
                colors={colors} 
                onPress={() => navigation.navigate("JudgeHearing" as any)} 
            />
            <ToolBtn 
                icon="library-outline" 
                label="Code Pénal" 
                color={JUDGE_ACCENT} 
                colors={colors} 
                onPress={() => Alert.alert("Bibliothèque", "Accès aux Codes du Niger sécurisé.")} 
            />
            <ToolBtn 
                icon="archive-outline" 
                label="Archives" 
                color={JUDGE_ACCENT} 
                colors={colors} 
                onPress={() => navigation.navigate("JudgeDecisions" as any)} 
            />
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

// --- SOUS-COMPOSANTS ---

const StatCard = ({ icon, value, label, color, bgColor, onPress, colors }: any) => (
  <TouchableOpacity 
    style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statNumber, { color: colors.textMain }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSub }]}>{label}</Text>
  </TouchableOpacity>
);

const ActionCard = ({ icon, title, desc, color, colors, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.8}
    style={[styles.actionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
    onPress={onPress}
  >
    <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={[styles.actionTitle, { color: colors.textMain }]}>{title}</Text>
      <Text style={[styles.actionDesc, { color: colors.textSub }]}>{desc}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
  </TouchableOpacity>
);

const ToolBtn = ({ icon, label, color, colors, onPress }: any) => (
  <TouchableOpacity style={[styles.toolBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]} onPress={onPress}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={[styles.toolText, { color: colors.textMain }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 10 },
  headerSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 25 },
  welcomeInfo: { flex: 1 },
  welcomeSub: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", marginTop: 2 },
  rankText: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  clockBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, elevation: 4 },
  clockText: { color: "#FFF", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  oathBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 15, marginBottom: 30, borderWidth: 1, gap: 10 },
  oathText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 35 },
  statCard: { width: "31%", paddingVertical: 20, borderRadius: 24, alignItems: "center", borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "900", marginTop: 8 },
  statLabel: { fontSize: 9, fontWeight: "800", textTransform: 'uppercase', marginTop: 4 },
  sectionHeader: { fontSize: 11, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginTop: 10, marginLeft: 4 },
  actionCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 22, marginBottom: 15, borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 15 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: "800" },
  actionDesc: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  toolsRow: { flexDirection: "row", gap: 12 },
  toolBtn: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: "center", borderWidth: 1, gap: 8 },
  toolText: { fontSize: 10, fontWeight: "800" }
});