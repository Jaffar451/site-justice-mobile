import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// ✅ Architecture & Layout
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAuthStore } from "../../stores/useAuthStore";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Helper interne pour afficher une ligne d'info stylisée
const SettingItem = ({ label, subLabel, icon, onPress, color, colors, showArrow = true }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7} 
    style={[styles.settingItem, { borderBottomColor: colors.border }]} 
    onPress={onPress}
  >
    <View style={styles.settingLeft}>
      <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.textMain }]}>{label}</Text>
        {subLabel && <Text style={[styles.settingSubLabel, { color: colors.textSub }]}>{subLabel}</Text>}
      </View>
    </View>
    {showArrow && <Ionicons name="chevron-forward" size={18} color={colors.textSub} />}
  </TouchableOpacity>
);

export default function AdminSettingsScreen() {
  const { theme, isDark } = useAppTheme();
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  // ✅ Palette dynamique
  const primaryColor = theme.colors.primary;
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    btnEdit: isDark ? "#334155" : "#F1F5F9",
  };

  const handleLogout = () => {
    const title = "Déconnexion";
    const msg = "Voulez-vous vraiment mettre fin à cette session administrative sécurisée ?";

    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${msg}`)) logout();
    } else {
        Alert.alert(title, msg, [
            { text: "Annuler", style: "cancel" },
            { text: "Se déconnecter", style: "destructive", onPress: () => logout() }
        ]);
    }
  };

  if (!user) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Paramètres" showBack={true} />
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
            <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Configuration Système" showBack={true} />

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.bgMain }]}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- SECTION 1 : PROFIL ACTUEL --- */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.profileBrief}>
                <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                    <Text style={styles.avatarText}>{user?.firstname?.charAt(0)}</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>
                        {user?.firstname} {user?.lastname?.toUpperCase()}
                    </Text>
                    <Text style={[styles.userSub, { color: colors.textSub }]}>{user?.email}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.editBtn, { backgroundColor: colors.btnEdit }]}
                    onPress={() => navigation.navigate("AdminEditProfile")}
                >
                    <Text style={{ color: primaryColor, fontWeight: '800', fontSize: 11 }}>ÉDITER</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* --- SECTION 2 : GESTION DES RESSOURCES --- */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Unités & Personnels</Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <SettingItem 
                icon="people-outline" 
                label="Gestion des agents" 
                subLabel="Habilitations des magistrats et officiers"
                color={primaryColor}
                colors={colors}
                onPress={() => navigation.navigate("AdminUsers")}
            />
            <SettingItem 
                icon="business-outline" 
                label="Juridictions" 
                subLabel="Tribunaux, Cours et Commissariats"
                color={primaryColor}
                colors={colors}
                onPress={() => navigation.navigate("AdminCourts")}
            />
        </View>

        {/* --- SECTION 3 : SÉCURITÉ & AUDIT --- */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Intégrité & Infrastructure</Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <SettingItem 
                icon="finger-print-outline" 
                label="Journal d'Audit" 
                subLabel="Traçabilité des actes judiciaires"
                color="#059669"
                colors={colors}
                onPress={() => navigation.navigate("AdminLogs")}
            />
            <SettingItem 
                icon="lock-closed-outline" 
                label="Politique de Sécurité" 
                subLabel="Complexité et expiration des accès"
                color="#8B5CF6"
                colors={colors}
                onPress={() => navigation.navigate("AdminSecurity")}
            />
            <SettingItem 
                icon="construct-outline" 
                label="Maintenance Système" 
                subLabel="Contrôle du mode maintenance"
                color="#E67E22"
                colors={colors}
                onPress={() => navigation.navigate("AdminMaintenance")}
            />
        </View>

        {/* --- SECTION 4 : SESSION --- */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Session Administrative</Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <SettingItem 
                icon="log-out-outline" 
                label="Quitter l'espace sécurisé" 
                subLabel="Déconnexion immédiate du terminal"
                color="#EF4444"
                showArrow={false}
                colors={colors}
                onPress={handleLogout}
            />
        </View>

        {/* --- FOOTER INFO --- */}
        <View style={styles.footerInfo}>
          <Text style={[styles.versionText, { color: colors.textSub }]}>REPUBLIQUE DU NIGER • MINISTÈRE DE LA JUSTICE</Text>
          <Text style={[styles.buildText, { color: colors.textSub }]}>Version 1.2.0 • Plateforme e-Justice</Text>
          <View style={[styles.statusIndicator, { backgroundColor: "#10B981" }]} />
          <Text style={[styles.statusText, { color: "#10B981" }]}>Serveur Central Opérationnel</Text>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 10 },
  
  sectionTitle: { 
    fontSize: 10, fontWeight: "900", marginBottom: 10, marginTop: 25, 
    textTransform: "uppercase", letterSpacing: 1.5, marginLeft: 8 
  },
  
  card: { 
    borderRadius: 28, paddingVertical: 4, marginBottom: 10,
    borderWidth: 1, ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
        android: { elevation: 2 }
    })
  },

  profileBrief: { flexDirection: "row", alignItems: "center", padding: 20 },
  avatar: { width: 54, height: 54, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  profileInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 17, fontWeight: "900", letterSpacing: -0.5 },
  userSub: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },

  settingItem: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", 
    paddingHorizontal: 20, paddingVertical: 18
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 15 },
  settingLabel: { fontSize: 15, fontWeight: "800" },
  settingSubLabel: { fontSize: 11, fontWeight: "600", marginTop: 3 },

  footerInfo: { alignItems: "center", marginTop: 50 },
  versionText: { fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  buildText: { fontSize: 9, marginTop: 5, fontWeight: "600" },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginTop: 20, marginBottom: 8 },
  statusText: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" }
});