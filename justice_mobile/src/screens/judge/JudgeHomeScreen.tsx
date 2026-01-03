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
  Platform,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const { width } = Dimensions.get("window");

export default function JudgeHomeScreen({ navigation }: JudgeScreenProps<'JudgeHome'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🕒 HORLOGE TEMPS RÉEL
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateFull = currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    shadow: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)",
  };

  const judicialTitle = user?.lastname 
    ? `Juge ${user.lastname.toUpperCase()}` 
    : "Magistrat du Siège";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Cabinet de Justice" showMenu={true} />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        
        {/* 🏛️ 1. HEADER AVEC HORLOGE DYNAMIQUE */}
        <View style={styles.headerSection}>
          <View style={styles.welcomeInfo}>
            <Text style={[styles.welcomeSub, { color: colors.textSub }]}>{dateFull}</Text>
            <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>Bonjour, {user?.firstname}</Text>
            <Text style={[styles.rankText, { color: primaryColor }]}>{judicialTitle}</Text>
          </View>
          <LinearGradient 
            colors={[primaryColor, isDark ? "#422006" : primaryColor + 'DD']} 
            style={styles.clockBadge}
          >
            <Text style={styles.clockText}>{timeString}</Text>
          </LinearGradient>
        </View>

        {/* ⚖️ 2. BANDEAU DE DÉONTOLOGIE */}
        <View style={[styles.oathBanner, { backgroundColor: isDark ? "#1E293B" : primaryColor + '08', borderColor: isDark ? colors.border : primaryColor + '20' }]}>
           <Ionicons name="ribbon-outline" size={20} color={primaryColor} />
           <Text style={[styles.oathText, { color: colors.textSub }]}>Rigueur • Impartialité • Célérité</Text>
        </View>

        {/* 📊 3. INDICATEURS DE CABINET (KPIs) */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon="folder-open" 
            value="12" 
            label="En cours" 
            color={primaryColor} 
            bgColor={isDark ? "#1E3A8A20" : "#F0F9FF"} 
            onPress={() => navigation.navigate("JudgeCaseList")}
            colors={colors}
          />
          <StatCard 
            icon="calendar" 
            value="4" 
            label="Audiences" 
            color="#10B981" 
            bgColor={isDark ? "#064E3B20" : "#ECFDF5"} 
            onPress={() => navigation.navigate("JudgeCalendar")}
            colors={colors}
          />
          <StatCard 
            icon="alert-circle" 
            value="02" 
            label="Urgences" 
            color="#EF4444" 
            bgColor={isDark ? "#7F1D1D20" : "#FEF2F2"} 
            onPress={() => navigation.navigate("JudgeCaseList")}
            colors={colors}
          />
        </View>

        {/* 📂 4. PILOTAGE JUDICIAIRE */}
        <Text style={[styles.sectionHeader, { color: colors.textSub }]}>Pilotage du Cabinet</Text>
        
        <ActionCard 
          icon="briefcase" 
          title="Rôle d'Instruction" 
          desc="Traitement des dossiers et ordonnances."
          color={primaryColor}
          colors={colors}
          onPress={() => navigation.navigate("JudgeCaseList")}
        />

        <ActionCard 
          icon="document-text" 
          title="Registre des Jugements" 
          desc="Historique des minutes et délibérés."
          color="#10B981"
          colors={colors}
          onPress={() => navigation.navigate("JudgeDecisions")}
        />

        {/* 🛠️ 5. OUTILS PROFESSIONNELS */}
        <Text style={[styles.sectionHeader, { color: colors.textSub }]}>Outils Professionnels</Text>
        <View style={styles.toolsRow}>
            <ToolBtn icon="today-outline" label="Agenda" color={primaryColor} colors={colors} onPress={() => navigation.navigate("JudgeCalendar")} />
            <ToolBtn icon="library-outline" label="Lois" color={primaryColor} colors={colors} onPress={() => Alert.alert("Bibliothèque", "Accès aux Codes du Niger sécurisé.")} />
            <ToolBtn icon="key-outline" label="Clé-Sign" color={primaryColor} colors={colors} onPress={() => navigation.navigate("Profile" as any)} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

// Sous-composants pour plus de clarté
const StatCard = ({ icon, value, label, color, bgColor, onPress, colors }: any) => (
  <TouchableOpacity 
    style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
    onPress={onPress}
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
  container: { padding: 20, paddingBottom: 140 },
  headerSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 25 },
  welcomeInfo: { flex: 1 },
  welcomeSub: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  welcomeTitle: { fontSize: 26, fontWeight: "900", marginTop: 2 },
  rankText: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  clockBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, elevation: 4 },
  clockText: { color: "#FFF", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  oathBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 15, marginBottom: 30, borderWidth: 1, gap: 10 },
  oathText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 35 },
  statCard: { width: "31%", paddingVertical: 20, borderRadius: 24, alignItems: "center", borderWidth: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "900", marginTop: 8 },
  statLabel: { fontSize: 9, fontWeight: "800", textTransform: 'uppercase', marginTop: 4 },
  sectionHeader: { fontSize: 13, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginTop: 10 },
  actionCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 22, marginBottom: 15, borderWidth: 1 },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 15 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: "800" },
  actionDesc: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  toolsRow: { flexDirection: "row", gap: 12 },
  toolBtn: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: "center", borderWidth: 1, gap: 8 },
  toolText: { fontSize: 10, fontWeight: "800" }
});