import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { getAppTheme } from "../../theme";
import { ClerkScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const { width } = Dimensions.get("window");
const itemWidth = (width - 44) / 2; 

export default function ClerkHomeScreen({ navigation }: ClerkScreenProps<'ClerkHome'>) {
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const { user } = useAuthStore();

  // 🕒 ÉTAT POUR L'HORLOGE TEMPS RÉEL
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateFull = currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  const stats = [
    { label: "À Enrôler", value: "14", color: "#F59E0B", icon: "document-text", alert: true },
    { label: "Audiences", value: "5", color: "#10B981", icon: "calendar", alert: false },
    { label: "Écrous", value: "32", color: "#EF4444", icon: "lock-closed", alert: true },
  ];

  const menuItems = [
    { title: "Enrôlement (RP)", subtitle: "Réception Parquet", icon: "create", route: "ClerkComplaints", color: primaryColor },
    { title: "Rôle d'Audience", subtitle: "Planning Journalier", icon: "list", route: "ClerkCalendar", color: "#6366F1" },
    { title: "Registre Scellés", subtitle: "Pièces à Conviction", icon: "archive", route: "ClerkConfiscation", color: "#8B5CF6" },
    { title: "Levée d'Écrou", subtitle: "Ordres de Libération", icon: "key", route: "ClerkRelease", color: "#EC4899" }
  ];

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="dark-content" />
      <AppHeader title="Gestion du Greffe" showMenu={true} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 👋 WIDGET HORLOGE & BIENVENUE */}
        <View style={styles.welcomeSection}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateText}>{dateFull}</Text>
              <Text style={styles.welcomeTitle}>
                Maître <Text style={{ color: primaryColor }}>{user?.lastname || "le Greffier"}</Text>
              </Text>
            </View>
            
            {/* 🕒 Horloge Digitale Compacte */}
            <LinearGradient 
              colors={[primaryColor, primaryColor + 'DD']} 
              style={styles.clockBadge}
            >
              <Text style={styles.clockText}>{timeString}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* 📊 INDICATEURS CLÉS (Dashboard Rapide) */}
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
              {stat.alert && <View style={[styles.alertDot, { backgroundColor: stat.color }]} />}
              <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 🛠️ SERVICES DU GREFFE */}
        <Text style={styles.sectionTitle}>Services du Greffe</Text>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={styles.gridItem}
              // @ts-ignore
              onPress={() => item.route && navigation.navigate(item.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + "12" }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub} numberOfLines={1}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ℹ️ NOTE DE SERVICE / ALERTE */}
        <View style={[styles.alertBox, { backgroundColor: "#F0F9FF", borderColor: primaryColor + '20' }]}>
          <View style={[styles.infoIconBox, { backgroundColor: primaryColor }]}>
            <Ionicons name="notifications" size={18} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: primaryColor }]}>Procédure de Fin de Séance</Text>
              <Text style={styles.alertText}>
                N'oubliez pas de certifier les procès-verbaux d'audience avant 18h00.
              </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { padding: 16 },
  welcomeSection: { marginBottom: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2, color: "#94A3B8" },
  welcomeTitle: { fontSize: 24, fontWeight: "900", color: "#1E293B", marginTop: 2 },
  
  clockBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  clockText: { color: "#FFF", fontSize: 18, fontWeight: "900", letterSpacing: 1 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  statCard: {
    width: "31%",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderTopWidth: 4,
    elevation: 2,
    position: 'relative'
  },
  alertDot: { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },
  statValue: { fontSize: 22, fontWeight: "900", marginTop: 8, color: "#1E293B" },
  statLabel: { fontSize: 9, fontWeight: "800", marginTop: 2, textTransform: 'uppercase', color: "#64748B" },

  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, color: "#94A3B8", letterSpacing: 1.5, textTransform: 'uppercase' },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  gridItem: {
    width: itemWidth,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  itemTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  itemSub: { fontSize: 11, fontWeight: "600", color: "#94A3B8", marginTop: 2 },

  alertBox: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 20,
    marginTop: 30,
    gap: 15,
    alignItems: "center",
    borderWidth: 1,
  },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontWeight: "900", fontSize: 13, marginBottom: 2 },
  alertText: { fontSize: 11, lineHeight: 16, fontWeight: "600", color: "#64748B" },
});