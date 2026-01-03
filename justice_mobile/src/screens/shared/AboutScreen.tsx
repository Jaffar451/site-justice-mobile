import React, { useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Platform,
  Share,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Navigation
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

// Imports Architecture & Layout
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAuthStore } from "../../stores/useAuthStore";

export default function AboutScreen() {
  // ✅ 2. Hook de Navigation
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  
  const APP_VERSION = "1.0.5 (Build 2026)";
  const WEBSITE_URL = "https://justice.gouv.ne"; 

  /**
   * ✅ Couleurs Institutionnelles Dynamiques
   */
  const brandColor = useMemo(() => {
    const role = (user?.role || "citizen").toLowerCase();
    switch (role) {
      case "admin": return "#1E293B";
      case "police": 
      case "commissaire": return "#1E3A8A";
      case "judge":
      case "prosecutor":
      case "clerk": return "#7C2D12";
      default: return "#0891B2";
    }
  }, [user?.role]);

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Erreur d'ouverture :", err);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Justice Mobile Niger : Accédez aux services judiciaires de manière sécurisée. Téléchargez l'application officielle : ${WEBSITE_URL}`,
        title: "e-Justice Niger"
      });
    } catch (error) {
      console.error(error);
    }
  };

  const InfoRow = ({ icon, label, action, color = brandColor, isLast = false }: any) => (
    <TouchableOpacity 
      activeOpacity={0.6}
      style={[
        styles.row, 
        { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: isDark ? "#333" : "#F1F5F9" }
      ]} 
      onPress={action}
      disabled={!action}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.miniIconBg, { backgroundColor: color + "15" }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.rowLabel, { color: isDark ? "#FFF" : "#1E293B" }]}>{label}</Text>
      </View>
      {action && <Ionicons name="chevron-forward" size={18} color="#94A3B8" />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="À Propos de e-Justice" showBack={true} />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 🏛️ SECTION MARQUE INSTITUTIONNELLE */}
        <View style={styles.brandSection}>
          <View style={[styles.logoContainer, { backgroundColor: isDark ? "#1A1A1A" : "#FFF", shadowColor: brandColor }]}>
            <Ionicons name="scale-outline" size={64} color={brandColor} />
            <View style={[styles.badgeNiger, { backgroundColor: "#E67E22" }]}>
                <Text style={styles.badgeText}>NIGER</Text>
            </View>
          </View>
          
          <Text style={[styles.appName, { color: isDark ? "#FFF" : "#1E293B" }]}>e-Justice Mobile</Text>
          <Text style={[styles.appSubName, { color: brandColor }]}>Ministère de la Justice</Text>
          
          <View style={[styles.versionBadge, { backgroundColor: isDark ? "#2A2A2A" : "#F1F5F9" }]}>
             <Text style={[styles.versionText, { color: isDark ? "#94A3B8" : "#64748B" }]}>VERSION {APP_VERSION}</Text>
          </View>
        </View>

        {/* 📜 MISSION DE LA PLATEFORME */}
        <View style={[styles.card, { backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF", borderColor: isDark ? "#333" : "#F1F5F9" }]}>
          <Text style={[styles.description, { color: isDark ? "#CBD5E1" : "#1E293B" }]}>
            Justice Mobile est l'outil pivot de la modernisation judiciaire au Niger. Elle permet la saisine sécurisée des juridictions, 
            le suivi des dossiers en temps réel et facilite l'accès au droit pour chaque citoyen, 
            garantissant une justice de proximité, équitable et transparente.
          </Text>
        </View>

        {/* 🔗 RESSOURCES & ÉCOSYSTÈME */}
        <Text style={styles.sectionTitle}>Ressources Officielles</Text>
        <View style={[styles.card, { backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF", paddingVertical: 0, borderColor: isDark ? "#333" : "#F1F5F9" }]}>
          <InfoRow 
            icon="globe-outline" 
            label="Portail Web du Ministère" 
            action={() => handleOpenLink(WEBSITE_URL)} 
          />
          
          {/* ✅ NAVIGATION INTERNE VERS LE GUIDE */}
          <InfoRow 
            icon="document-text-outline" 
            label="Guide de l'utilisateur" 
            action={() => navigation.navigate("UserGuide")} 
          />
          
          <InfoRow 
            icon="share-social-outline" 
            label="Partager l'application" 
            action={handleShareApp} 
          />
          
          {/* ✅ NAVIGATION INTERNE VERS LE SUPPORT */}
          <InfoRow 
            icon="headset-outline" 
            label="Support Technique" 
            isLast={true}
            action={() => navigation.navigate("Support")} 
          />
        </View>

        {/* 🛡️ SIGNATURE INSTITUTIONNELLE */}
        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: "#94A3B8" }]}>
            © 2026 Ministère de la Justice et des Droits de l'Homme
          </Text>
          <View style={[styles.divider, { backgroundColor: brandColor }]} />
          <Text style={[styles.devCredit, { color: isDark ? "#FFF" : "#1E293B" }]}>
            Direction de la Modernisation
          </Text>
          <Text style={styles.devCreditSub}>
            REPUBLIQUE DU NIGER
          </Text>
        </View>

      </ScrollView>

      {/* ✅ Footer ajouté pour permettre de revenir au menu principal rapidement */}
      <SmartFooter />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 150 },
  brandSection: { alignItems: "center", marginBottom: 35, marginTop: 10 },
  logoContainer: {
    width: 120, height: 120, borderRadius: 35,
    justifyContent: "center", alignItems: "center",
    marginBottom: 20, elevation: 8,
    shadowOpacity: 0.1, shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    position: 'relative',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'
  },
  badgeNiger: {
    position: 'absolute', bottom: -10,
    paddingHorizontal: 15, paddingVertical: 4,
    borderRadius: 12, elevation: 4
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  appName: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  appSubName: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  versionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 15 },
  versionText: { fontSize: 9, fontWeight: "bold" },
  card: {
    borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
        android: { elevation: 2 }
    })
  },
  description: { fontSize: 14, lineHeight: 24, textAlign: "center", fontWeight: "500" },
  sectionTitle: { fontSize: 11, fontWeight: "800", marginBottom: 10, marginLeft: 10, color: "#94A3B8", textTransform: 'uppercase' },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, paddingHorizontal: 15 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  miniIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  footer: { alignItems: "center", marginTop: 20 },
  copyright: { fontSize: 11, fontWeight: "600", textAlign: "center", width: '80%' },
  divider: { width: 40, height: 3, marginVertical: 20, borderRadius: 2, opacity: 0.4 },
  devCredit: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  devCreditSub: { fontSize: 9, fontWeight: "700", marginTop: 4, color: "#94A3B8" }
});