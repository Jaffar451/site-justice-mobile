// PATH: src/navigation/DrawerNavigator.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList,
  DrawerContentComponentProps 
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

// Stores & Theme
import { useAuthStore } from "../stores/useAuthStore";
import { useAppTheme } from "../theme/AppThemeProvider";

// ✅ IMPORT DES STACKS SPÉCIALISÉES
// Assure-toi que ces fichiers existent dans src/navigation/stacks/
import AdminStack from "./stacks/AdminStack";
import PoliceStack from "./stacks/PoliceStack";
import JudgeStack from "./stacks/JudgeStack";
import ProsecutorStack from "./stacks/ProsecutorStack";
import CommissaireStack from "./stacks/CommissaireStack";
import ClerkStack from "./stacks/ClerkStack";
import CitizenStack from "./stacks/CitizenStack"; // 👈 C'est ici que sont tes écrans Directory et Downloads
import LawyerStack from "./stacks/LawyerStack";
import BailiffStack from "./stacks/BailiffStack";

// Écrans Communs
import ProfileScreen from "../screens/Profile/ProfileScreen";
import AboutScreen from "../screens/shared/AboutScreen"; 

const Drawer = createDrawerNavigator();

// ---------------------------------------------------------
// 🎨 CONTENU PERSONNALISÉ DU DRAWER (HEADER & FOOTER)
// ---------------------------------------------------------
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { theme, isDark } = useAppTheme(); 
  const { user, logout } = useAuthStore();

  // Configuration dynamique des couleurs et titres selon le rôle
  const config = useMemo(() => {
    const role = user?.role?.toLowerCase() || "";
    
    // Forces de l'ordre (Bleu Police)
    if (["police", "commissaire"].includes(role)) 
        return { bg: "#1E3A8A", label: "FORCES DE SÉCURITÉ", icon: "shield-checkmark" };
    
    // Magistrats (Rouge Bordeaux)
    if (["judge", "prosecutor", "clerk"].includes(role)) 
        return { bg: "#7C2D12", label: "CORPS JUDICIAIRE", icon: "balance-scale" };
    
    // Admin (Gris Sombre)
    if (role === "admin") 
        return { bg: "#1E293B", label: "ADMINISTRATION CENTRALE", icon: "settings" };
    
    // Avocats/Huissiers (Indigo/Violet)
    if (role === "lawyer" || role === "bailiff") 
        return { bg: "#4338CA", label: "AUXILIAIRE DE JUSTICE", icon: "briefcase" };
    
    // ✅ CITOYEN (Vert Justice - Harmonisé avec ton annuaire)
    return { bg: "#166534", label: "ESPACE CITOYEN", icon: "person" };
  }, [user?.role]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* En-tête du Drawer */}
      <View style={[styles.drawerHeader, { backgroundColor: config.bg }]}>
        <View style={styles.logoCircle}>
            <Ionicons name={config.icon as any} size={28} color={config.bg} />
        </View>
        <View>
            <Text style={styles.userName}>
                {user?.firstname} {user?.lastname?.toUpperCase()}
            </Text>
            <View style={styles.badge}>
                <Text style={styles.userRole}>{config.label}</Text>
            </View>
        </View>
      </View>

      {/* Liste des menus générée par React Navigation */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Pied de page du Drawer (Déconnexion) */}
      <View style={[styles.drawerFooter, { borderTopColor: isDark ? "#2A2A2A" : "#F1F5F9" }]}>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={[styles.logoutText, { color: theme.colors.text }]}>Fermer la session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------
// 🚀 NAVIGATEUR PRINCIPAL (DRAWER)
// ---------------------------------------------------------
export default function DrawerNavigator() {
  const { theme, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  
  // Sécurité : Si pas de user, on considère comme citoyen par défaut (ou on redirige)
  const role = useMemo(() => (user?.role || "citizen").toLowerCase(), [user?.role]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // On laisse les Stacks gérer leurs Headers
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: isDark ? "#94A3B8" : "#475569",
        drawerLabelStyle: { fontWeight: "700", marginLeft: -10 },
        drawerItemStyle: { borderRadius: 8, marginHorizontal: 10, marginVertical: 2 },
        drawerStyle: { width: 300, backgroundColor: theme.colors.background },
      }}
    >
      {/* 👨‍💼 ADMIN */}
      {role === "admin" && (
        <Drawer.Screen name="AdminRoot" component={AdminStack} options={{
          drawerLabel: "Tableau de Bord Admin",
          drawerIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} />
        }} />
      )}

      {/* 👮 POLICE */}
      {role === "police" && (
        <Drawer.Screen name="PoliceRoot" component={PoliceStack} options={{
          drawerLabel: "Procédures OPJ",
          drawerIcon: ({ color }) => <Ionicons name="shield-half" size={22} color={color} />
        }} />
      )}

      {/* 👮‍♂️ COMMISSAIRE */}
      {role === "commissaire" && (
        <Drawer.Screen name="CommissaireRoot" component={CommissaireStack} options={{
          drawerLabel: "Supervision Hiérarchique",
          drawerIcon: ({ color }) => <Ionicons name="eye" size={22} color={color} />
        }} />
      )}

      {/* 👨‍⚖️ JUGE */}
      {role === "judge" && (
        <Drawer.Screen name="JudgeRoot" component={JudgeStack} options={{
          drawerLabel: "Cabinet du Juge",
          drawerIcon: ({ color }) => <Ionicons name="scale-outline" size={22} color={color} />
        }} />
      )}

      {/* ⚖️ PROCUREUR */}
      {role === "prosecutor" && (
        <Drawer.Screen name="ProsecutorRoot" component={ProsecutorStack} options={{
          drawerLabel: "Parquet de la République",
          drawerIcon: ({ color }) => <Ionicons name="briefcase" size={22} color={color} />
        }} />
      )}

      {/* 📝 GREFFIER */}
      {role === "clerk" && (
        <Drawer.Screen name="ClerkRoot" component={ClerkStack} options={{
          drawerLabel: "Greffe & Enrôlement",
          drawerIcon: ({ color }) => <Ionicons name="document-text" size={22} color={color} />
        }} />
      )}

      {/* 📜 HUISSIER */}
      {role === "bailiff" && (
        <Drawer.Screen name="BailiffRoot" component={BailiffStack} options={{
          drawerLabel: "Exploits d'Huissier",
          drawerIcon: ({ color }) => <Ionicons name="mail-open" size={22} color={color} />
        }} />
      )}

      {/* ⚖️ AVOCAT */}
      {role === "lawyer" && (
        <Drawer.Screen name="LawyerRoot" component={LawyerStack} options={{
          drawerLabel: "Cabinet d'Avocat",
          drawerIcon: ({ color }) => <Ionicons name="medal" size={22} color={color} />
        }} />
      )}

      {/* 👨‍👩‍👧‍👦 CITOYEN */}
      {/* C'est ce Stack qui contient CitizenDirectoryScreen et MyDownloadsScreen */}
      {role === "citizen" && (
        <Drawer.Screen name="CitizenRoot" component={CitizenStack} options={{
          drawerLabel: "Mes Services Citoyen",
          drawerIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />
        }} />
      )}

      {/* ⚙️ OPTIONS COMMUNES (Visibles pour tous) */}
      <Drawer.Screen name="ProfileRoot" component={ProfileScreen} options={{
        drawerLabel: "Mon Profil",
        drawerIcon: ({ color }) => <Ionicons name="person-circle" size={22} color={color} />
      }} />

      <Drawer.Screen name="HelpRoot" component={AboutScreen} options={{
        drawerLabel: "À Propos & Aide",
        drawerIcon: ({ color }) => <Ionicons name="help-circle" size={22} color={color} />
      }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { padding: 20, paddingTop: 60, paddingBottom: 30 },
  logoCircle: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff", 
    justifyContent: "center", alignItems: "center", marginBottom: 15,
    elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5
  },
  userName: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  badge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', 
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  userRole: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  drawerFooter: { padding: 20, borderTopWidth: 1, marginTop: 'auto' }, // marginTop auto pousse le footer en bas
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  logoutText: { fontSize: 15, fontWeight: "700" },
});