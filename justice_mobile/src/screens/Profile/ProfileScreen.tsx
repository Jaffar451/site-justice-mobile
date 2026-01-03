import React, { useMemo, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  Switch
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Navigation
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { isDark, setScheme } = useAppTheme(); 
  
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  const roleColor = useMemo(() => {
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

  const handleLogout = () => {
    if (Platform.OS === 'web') {
        const confirm = window.confirm("Déconnexion : Voulez-vous vraiment quitter l'application ?");
        if (confirm) logout();
    } else {
        Alert.alert(
          "Déconnexion",
          "Voulez-vous vraiment quitter l'application ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Se déconnecter", style: "destructive", onPress: logout }
          ]
        );
    }
  };

  const handleThemeToggle = () => {
    setScheme(isDark ? 'light' : 'dark');
  };

  const handleBiometricToggle = () => {
    setIsBiometricEnabled(!isBiometricEnabled);
    if (!isBiometricEnabled && Platform.OS !== 'web') {
        Alert.alert("Sécurité", "Authentification biométrique activée.");
    }
  };

  const handleHelpNavigation = () => {
    const role = (user?.role || "citizen").toLowerCase();
    navigation.navigate(role === 'admin' ? "AdminSettings" : "HelpCenter");
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      citizen: "Citoyen",
      police: "Officier (OPJ)",
      commissaire: "Commissaire",
      judge: "Magistrat du Siège",
      prosecutor: "Magistrat du Parquet",
      clerk: "Greffier",
      admin: "Administrateur National"
    };
    return roles[role.toLowerCase()] || role.toUpperCase();
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Mon Profil" showBack={true} />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 👤 EN-TÊTE PROFILE */}
        <View style={[styles.header, { backgroundColor: roleColor }]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.avatarText}>
                    {user?.firstname?.[0]}{user?.lastname?.[0]}
                  </Text>
              </View>
              <View style={[styles.onlineBadge, { borderColor: roleColor }]} />
            </View>
            
            <Text style={styles.name}>{user?.firstname} {user?.lastname?.toUpperCase()}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{getRoleLabel(user?.role || "")}</Text>
            </View>
        </View>

        {/* 📊 STATISTIQUES */}
        <View style={[styles.statsCard, { backgroundColor: colors.bgCard, shadowColor: "#000" }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textMain }]}>12</Text>
              <Text style={styles.statLabel}>Dossiers</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: roleColor }]}>4</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#10B981" }]}>8</Text>
              <Text style={styles.statLabel}>Archives</Text>
            </View>
        </View>

        {/* 📋 MENU DES OPTIONS */}
        <View style={styles.menuWrapper}>
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>SÉCURITÉ ET IDENTITÉ</Text>
            
            <MenuItem 
              icon="person-circle-outline" 
              label="Modifier mes informations" 
              primaryColor={roleColor}
              colors={colors}
              onPress={() => navigation.navigate("EditProfile")} 
            />
            
            <View style={[styles.menuItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.menuLeft}>
                    <View style={[styles.iconBox, { backgroundColor: roleColor + "15" }]}>
                        <Ionicons name="finger-print-outline" size={20} color={roleColor} />
                    </View>
                    <Text style={[styles.menuText, { color: colors.textMain }]}>Accès Biométrique</Text>
                </View>
                <Switch 
                    value={isBiometricEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{ false: isDark ? "#334155" : "#E2E8F0", true: roleColor + "80" }}
                    thumbColor={isBiometricEnabled ? roleColor : "#f4f3f4"}
                />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 25, color: colors.textSub }]}>PRÉFÉRENCES</Text>
            
            <MenuItem 
              icon="notifications-outline" 
              label="Notifications Push" 
              primaryColor={roleColor}
              colors={colors}
              onPress={() => navigation.navigate("Notifications")} 
            />
            
            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                onPress={handleThemeToggle}
            >
                <View style={styles.menuLeft}>
                    <View style={[styles.iconBox, { backgroundColor: roleColor + "15" }]}>
                        <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={roleColor} />
                    </View>
                    <Text style={[styles.menuText, { color: colors.textMain }]}>
                        {isDark ? "Mode Sombre" : "Mode Clair"}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: colors.textSub, marginRight: 10 }}>
                        {isDark ? "Activé" : "Désactivé"}
                    </Text>
                    <Ionicons name="refresh-circle-outline" size={24} color={roleColor} />
                </View>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 25, color: colors.textSub }]}>SUPPORT</Text>
            
            <MenuItem 
              icon="help-buoy-outline" 
              label="Centre d'aide & Annuaire" 
              primaryColor={roleColor}
              colors={colors}
              onPress={handleHelpNavigation} 
            />
            
            {/* 🚪 DÉCONNEXION */}
            <TouchableOpacity 
              style={[styles.logoutBtn, { backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2", borderColor: isDark ? "#450a0a" : "#FEE2E2" }]} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Fermer la session sécurisée</Text>
            </TouchableOpacity>

            <Text style={[styles.versionFooter, { color: colors.textSub }]}>Version 1.5.0 • République du Niger</Text>
        </View>

      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const MenuItem = ({ icon, label, onPress, primaryColor, colors }: any) => (
  <TouchableOpacity 
    style={[styles.menuItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: primaryColor + "15" }]}>
            <Ionicons name={icon} size={20} color={primaryColor} />
        </View>
        <Text style={[styles.menuText, { color: colors.textMain }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 140 },
  header: { 
    alignItems: 'center', 
    paddingTop: 20,
    paddingBottom: 60, 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40 
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 5, 
  },
  avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  onlineBadge: { 
    width: 26, 
    height: 26, 
    backgroundColor: '#10B981', 
    borderRadius: 13, 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    borderWidth: 4, 
  },
  name: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  roleBadge: { backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

  statsCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    paddingVertical: 24, 
    marginHorizontal: 20, 
    marginTop: -35, 
    borderRadius: 24, 
    elevation: 8, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 } 
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },
  divider: { width: 1, height: '60%', alignSelf: 'center' },

  menuWrapper: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 14, 
    borderRadius: 18, 
    marginBottom: 10,
    borderWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 15, fontWeight: '600' },

  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    marginTop: 25, 
    padding: 16, 
    borderRadius: 18,
    borderWidth: 1,
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
  versionFooter: { textAlign: 'center', marginTop: 30, fontSize: 10, fontWeight: 'bold' }
});