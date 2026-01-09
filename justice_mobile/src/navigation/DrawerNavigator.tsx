// PATH: src/navigation/DrawerNavigator.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList,
  DrawerContentComponentProps 
} from "@react-navigation/drawer";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// ✅ Stores & Thème
import { useAuthStore } from "../stores/useAuthStore";
import { useAppTheme } from "../theme/AppThemeProvider";

// ✅ Stacks Métiers
import AdminStack from "./stacks/AdminStack";
import PoliceStack from "./stacks/PoliceStack";
import JudgeStack from "./stacks/JudgeStack";
import ProsecutorStack from "./stacks/ProsecutorStack";
import CommissaireStack from "./stacks/CommissaireStack";
import ClerkStack from "./stacks/ClerkStack";
import CitizenStack from "./stacks/CitizenStack"; 
import LawyerStack from "./stacks/LawyerStack";
import BailiffStack from "./stacks/BailiffStack";

// Écrans Communs
import ProfileScreen from "../screens/Profile/ProfileScreen";
import AboutScreen from "../screens/shared/AboutScreen"; 

const Drawer = createDrawerNavigator();

/**
 * 🎨 Composant de contenu personnalisé pour le Drawer
 * Gère l'identité visuelle du header selon le rôle.
 */
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { theme, isDark } = useAppTheme(); 
  const { user, logout } = useAuthStore();

  const config = useMemo(() => {
    const role = user?.role || "citizen";
    
    // 🔵 Forces de l'Ordre
    if (["officier_police", "commissaire", "inspecteur"].includes(role)) 
        return { bg: "#1E3A8A", label: "FORCES DE SÉCURITÉ", icon: "shield-checkmark" };
    
    // 🔴 Justice (Siège & Parquet)
    if (["judge", "prosecutor", "greffier"].includes(role)) 
        return { bg: "#7C2D12", label: "CORPS JUDICIAIRE", icon: "balance-scale" }; 
    
    // 🌑 Administration
    if (role === "admin") 
        return { bg: "#1E293B", label: "ADMINISTRATION CENTRALE", icon: "settings-outline" };
    
    // 🟢 Gendarmerie
    if (role.includes("gendarme"))
        return { bg: "#065F46", label: "GENDARMERIE NATIONALE", icon: "ribbon-outline" };

    // 🏆 Citoyen
    return { bg: "#166534", label: "ESPACE CITOYEN", icon: "person-outline" };
  }, [user?.role]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 🏛️ HEADER DU DRAWER */}
      <View style={[styles.drawerHeader, { backgroundColor: config.bg }]}>
        <View style={styles.logoCircle}>
            {config.icon === "balance-scale" ? (
                <FontAwesome5 name="balance-scale" size={24} color={config.bg} />
            ) : (
                <Ionicons name={config.icon as any} size={28} color={config.bg} />
            )}
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

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* 🚪 PIED DE PAGE (Déconnexion) */}
      <View style={[styles.drawerFooter, { borderTopColor: isDark ? "#2A2A2A" : "#F1F5F9" }]}>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={[styles.logoutText, { color: theme.colors.text }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DrawerNavigator() {
  const { theme, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role as any) || "citizen";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: isDark ? "#94A3B8" : "#475569",
        drawerLabelStyle: { fontWeight: "700", marginLeft: -10 },
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 10, marginVertical: 4 },
      }}
    >
      {/* 🛡️ ADMINISTRATION */}
      {role === "admin" && (
        <Drawer.Screen name="AdminRoot" component={AdminStack} options={{
          drawerLabel: "Administration",
          drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />
        }} />
      )}

      {/* 🚓 POLICE & GENDARMERIE */}
      {(role === "officier_police" || role === "inspecteur" || role.includes("gendarme")) && (
        <Drawer.Screen name="PoliceRoot" component={PoliceStack} options={{
          drawerLabel: "Procédures OPJ",
          drawerIcon: ({ color }) => <Ionicons name="shield-half-outline" size={22} color={color} />
        }} />
      )}

      {/* 👮 COMMANDEMENT POLICE */}
      {role === "commissaire" && (
        <Drawer.Screen name="CommissaireRoot" component={CommissaireStack} options={{
          drawerLabel: "Gestion de l'Unité",
          drawerIcon: ({ color }) => <Ionicons name="briefcase-outline" size={22} color={color} />
        }} />
      )}

      {/* ⚖️ JUGE */}
      {role === "judge" && (
        <Drawer.Screen name="JudgeRoot" component={JudgeStack} options={{
          drawerLabel: "Cabinet de Jugement",
          drawerIcon: ({ color }) => <FontAwesome5 name="balance-scale" size={18} color={color} />
        }} />
      )}

      {/* 🏛️ PROCUREUR */}
      {role === "prosecutor" && (
        <Drawer.Screen name="ProsecutorRoot" component={ProsecutorStack} options={{
          drawerLabel: "Parquet",
          drawerIcon: ({ color }) => <Ionicons name="library-outline" size={22} color={color} />
        }} />
      )}

      {/* ✍️ GREFFIER */}
      {role === "greffier" && (
        <Drawer.Screen name="ClerkRoot" component={ClerkStack} options={{
          drawerLabel: "Greffe Juridictionnel",
          drawerIcon: ({ color }) => <Ionicons name="document-attach-outline" size={22} color={color} />
        }} />
      )}

      {/* 💼 AVOCAT */}
      {role === "lawyer" && (
        <Drawer.Screen name="LawyerRoot" component={LawyerStack} options={{
          drawerLabel: "Cabinet d'Avocat",
          drawerIcon: ({ color }) => <Ionicons name="medal-outline" size={22} color={color} />
        }} />
      )}
      
      {/* 🚲 HUISSIER */}
      {role === "bailiff" && (
        <Drawer.Screen name="BailiffRoot" component={BailiffStack} options={{
          drawerLabel: "Étude d'Huissier",
          drawerIcon: ({ color }) => <Ionicons name="mail-outline" size={22} color={color} />
        }} />
      )}

      {/* 🌍 CITOYEN */}
      {role === "citizen" && (
        <Drawer.Screen name="CitizenRoot" component={CitizenStack} options={{
          drawerLabel: "Mon Espace Citoyen",
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />
        }} />
      )}

      {/* 👤 OPTIONS COMMUNES */}
      <Drawer.Screen name="ProfileRoot" component={ProfileScreen} options={{
        drawerLabel: "Mon Compte",
        drawerIcon: ({ color }) => <Ionicons name="person-circle-outline" size={22} color={color} />
      }} />

      <Drawer.Screen name="HelpRoot" component={AboutScreen} options={{
        drawerLabel: "Assistance & Infos",
        drawerIcon: ({ color }) => <Ionicons name="information-circle-outline" size={22} color={color} />
      }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { padding: 20, paddingTop: 60, paddingBottom: 30 },
  logoCircle: { 
    width: 50, height: 50, borderRadius: 25, backgroundColor: "#fff", 
    justifyContent: "center", alignItems: "center", marginBottom: 15 
  },
  userName: { color: "#fff", fontSize: 17, fontWeight: "900" },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5, marginTop: 5 },
  userRole: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  drawerFooter: { padding: 20, borderTopWidth: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  logoutText: { fontSize: 15, fontWeight: "700" },
});