import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { CitizenScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const { width } = Dimensions.get("window");
const gap = 12;
const itemWidth = (width - 44) / 2;

export default function CitizenHomeScreen({ navigation }: CitizenScreenProps<'CitizenHome'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  const primaryColor = "#0891B2"; // Cyan e-Justice

  const [currentTime, setCurrentTime] = useState(new Date());

  // 🕒 Horloge temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateFull = currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  // 🛠️ Services Citoyens
  const services = [
    { 
      id: "tracking", 
      title: "Suivi Dossier", 
      icon: "folder-open", 
      color: primaryColor, 
      route: "CitizenMyComplaints", 
      desc: "État d'avancement" 
    },
    { 
      id: "record", 
      title: "Casier Judiciaire", 
      icon: "ribbon", 
      color: "#EA580C", 
      route: "CitizenCriminalRecord", 
      desc: "Demande d'extrait B3" 
    },
    { 
      id: "directory", 
      title: "Carte des Services", 
      icon: "map-outline", 
      color: "#6366F1", 
      route: "StationMapScreen", // ✅ Mis à jour
      desc: "Police & Tribunaux" 
    },
    { 
      id: "help", 
      title: "Aide Juridique", 
      icon: "help-buoy", 
      color: "#8B5CF6", 
      route: "UserGuide", 
      desc: "Guide & Support" 
    }
  ];

  // 🎨 Palette Dynamique
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <AppHeader title="Portail Citoyen" showMenu={true} showSos={true} />

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.bgMain }]}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 👋 WIDGET BIENVENUE */}
        <View style={styles.welcomeSection}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.welcomeSub, { color: colors.textSub }]}>{dateFull}</Text>
              <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>
                Bonjour, <Text style={{ color: primaryColor }}>{user?.firstname || "Citoyen"}</Text>
              </Text>
            </View>
            <LinearGradient 
              colors={[primaryColor, '#0E7490']} 
              style={styles.clockBadge}
            >
              <Text style={styles.clockText}>{timeString}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* 🏛️ HERO CARD : ACTION PRINCIPALE */}
        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.heroCard, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate("CitizenCreateComplaint")}
        >
          <View style={{ zIndex: 2, flex: 1 }}>
            <Text style={styles.heroTitle}>Déposer une Plainte</Text>
            <Text style={styles.heroSub}>
              Saisissez les autorités en toute sécurité. Service disponible 24h/24 sans déplacement.
            </Text>
            <View style={styles.heroBtn}>
              <Text style={[styles.heroBtnText, { color: primaryColor }]}>COMMENCER</Text>
              <Ionicons name="arrow-forward" size={16} color={primaryColor} />
            </View>
          </View>
          <View style={styles.heroIconWrapper}>
            <Ionicons name="document-text" size={120} color="rgba(255,255,255,0.12)" />
          </View>
        </TouchableOpacity>

        {/* 🛠️ GRILLE DES SERVICES */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Services Digitaux</Text>
        <View style={styles.gridContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.8}
              style={[
                  styles.gridItem, 
                  { backgroundColor: colors.bgCard, borderColor: colors.border }
              ]}
              onPress={() => navigation.navigate(service.route as any)}
            >
              <View style={[styles.iconCircle, { backgroundColor: service.color + "12" }]}>
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.textMain }]} numberOfLines={1}>{service.title}</Text>
              <Text style={[styles.gridDesc, { color: colors.textSub }]} numberOfLines={2}>{service.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔐 INFO SÉCURITÉ */}
        <View style={[styles.infoCard, { borderColor: isDark ? '#1E3A8A' : '#BAE6FD' }]}>
          <LinearGradient 
            colors={isDark ? ['#172554', '#1E3A8A'] : ['#F0F9FF', '#E0F2FE']}
            style={styles.infoGradient}
          >
            <Ionicons name="lock-closed" size={24} color={isDark ? "#60A5FA" : "#0369A1"} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: isDark ? "#60A5FA" : "#0369A1" }]}>Données Protégées</Text>
              <Text style={[styles.infoText, { color: isDark ? "#BFDBFE" : "#64748B" }]}>
                Vos informations sont cryptées et traitées sous la supervision du Ministère de la Justice.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 }, 
  container: { padding: 16, paddingTop: 10 },
  welcomeSection: { marginBottom: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  welcomeSub: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", marginTop: 2 },
  clockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, elevation: 4 },
  clockText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  heroCard: { 
    borderRadius: 24, padding: 24, marginBottom: 25, overflow: "hidden", elevation: 8,
    shadowColor: '#0891B2', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }
  },
  heroTitle: { color: "#FFF", fontSize: 22, fontWeight: "900", marginBottom: 6 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 20, lineHeight: 18, fontWeight: '500' },
  heroBtn: { 
    backgroundColor: "#FFF", alignSelf: "flex-start", paddingHorizontal: 16, 
    paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 
  },
  heroBtnText: { fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
  heroIconWrapper: { position: "absolute", right: -20, bottom: -20 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.2, textTransform: 'uppercase' },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: gap },
  gridItem: { 
    width: itemWidth, padding: 16, borderRadius: 22, borderWidth: 1, elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5
  },
  iconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  gridTitle: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  gridDesc: { fontSize: 11, fontWeight: "600" },
  infoCard: { marginTop: 25, borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
  infoGradient: { padding: 20, flexDirection: "row", gap: 15, alignItems: "center" },
  // ✅ Correction styles texte information
  infoTitle: { fontWeight: "900", fontSize: 14, marginBottom: 2 },
  infoText: { fontSize: 11, fontWeight: "500", lineHeight: 16 },
});