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
  Switch,
  Image // ✅ Ajout pour l'image
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
  
  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  const roleColor = useMemo(() => {
    const role = (user?.role || "citizen").toLowerCase();
    switch (role) {
      case "admin": return "#1E293B";
      case "police": 
      case "commissaire": 
      case "officier_police": return "#1E3A8A"; // Bleu Roi
      case "judge":
      case "prosecutor":
      case "clerk": return "#7C2D12"; // Brun Terre (Justice)
      default: return "#059669"; // Vert Citoyen
    }
  }, [user?.role]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
        const confirm = window.confirm("Souhaitez-vous fermer votre session sécurisée ?");
        if (confirm) logout();
    } else {
        Alert.alert(
          "Déconnexion",
          "Voulez-vous fermer votre session sécurisée ?",
          [
            { text: "Rester", style: "cancel" },
            { text: "Se déconnecter", style: "destructive", onPress: logout }
          ]
        );
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      citizen: "Citoyen",
      police: "Officier (OPJ)",
      officier_police: "Officier (OPJ)",
      commissaire: "Commissaire de Police",
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
              <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.4)' }]}>
                  {/* ✅ Affichage conditionnel : Image ou Initiales */}
                  {(user as any)?.avatar ? (
                    <Image 
                      source={{ uri: (user as any).avatar }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user?.firstname?.[0]}{user?.lastname?.[0]}
                    </Text>
                  )}
              </View>
              <View style={[styles.onlineBadge, { borderColor: roleColor }]} />
            </View>
            
            <Text style={styles.name}>{user?.firstname} {user?.lastname?.toUpperCase()}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{getRoleLabel(user?.role || "")}</Text>
            </View>
        </View>

        {/* 📊 STATISTIQUES */}
        <View style={[styles.statsCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textMain }]}>12</Text>
              <Text style={styles.statLabel}>Dossiers</Text>
            </View>
            <View style={[styles.vDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: roleColor }]}>4</Text>
              <Text style={styles.statLabel}>Actifs</Text>
            </View>
            <View style={[styles.vDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#10B981" }]}>8</Text>
              <Text style={styles.statLabel}>Clos</Text>
            </View>
        </View>

        {/* 📋 MENU */}
        <View style={styles.menuWrapper}>
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>COMPTE</Text>
            
            <MenuItem 
              icon="create-outline" 
              label="Modifier mes informations" 
              primaryColor={roleColor}
              colors={colors}
              onPress={() => navigation.navigate("EditProfile")} // Ou AdminEditProfile selon le stack
            />

            <MenuItem 
              icon="settings-outline" 
              label="Paramètres & Sécurité" 
              primaryColor={roleColor}
              colors={colors}
              onPress={() => navigation.navigate("Settings")} 
            />
            
            <Text style={[styles.sectionTitle, { marginTop: 25, color: colors.textSub }]}>AIDE & SUPPORT</Text>

            <MenuItem 
              icon="book-outline" 
              label="Guide Utilisateur" 
              primaryColor={roleColor}
              colors={colors}
              onPress={() => navigation.navigate("UserGuide")} 
            />

            <MenuItem 
              icon="help-buoy-outline" 
              label="Contacter le Support" 
              primaryColor={roleColor}
              colors={colors}
              onPress={() => navigation.navigate("Support")} 
            />
            
            {/* 🚪 DÉCONNEXION */}
            <TouchableOpacity 
              style={[styles.logoutBtn, { backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2", borderColor: isDark ? "#450A0A" : "#FEE2E2" }]} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out" size={22} color="#EF4444" />
              <Text style={styles.logoutText}>Fermer la session</Text>
            </TouchableOpacity>

            <Text style={[styles.versionFooter, { color: colors.textSub }]}>
              e-JUSTICE NIGER • v1.5.0
            </Text>
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
    paddingTop: 30,
    paddingBottom: 70, 
    borderBottomLeftRadius: 45, 
    borderBottomRightRadius: 45 
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 4, 
    overflow: 'hidden' // Important pour l'image
  },
  avatarImage: { width: '100%', height: '100%' }, // Style image
  avatarText: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  onlineBadge: { 
    width: 24, 
    height: 24, 
    backgroundColor: '#10B981', 
    borderRadius: 12, 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    borderWidth: 3, 
  },
  name: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  roleBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: '#FFF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  statsCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    paddingVertical: 22, 
    marginHorizontal: 25, 
    marginTop: -40, 
    borderRadius: 24, 
    elevation: 8, 
    shadowColor: "#000",
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 } 
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '800', marginTop: 2, textTransform: 'uppercase' },
  vDivider: { width: 1, height: '70%', alignSelf: 'center', opacity: 0.2 },

  menuWrapper: { padding: 20, marginTop: 15 },
  sectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 15, letterSpacing: 1, textTransform: 'uppercase' },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 15, fontWeight: '700' },

  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    marginTop: 30, 
    padding: 18, 
    borderRadius: 20,
    borderWidth: 1,
  },
  logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 15 },
  versionFooter: { textAlign: 'center', marginTop: 35, fontSize: 10, fontWeight: '800', opacity: 0.5 }
});