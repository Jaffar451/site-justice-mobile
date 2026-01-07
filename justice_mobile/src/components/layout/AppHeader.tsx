import React, { useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  Insets, 
  StatusBar,
  Alert
} from "react-native";
import { useNavigation, DrawerActions, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Stores & Thème
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useNotificationStore } from "../../stores/notifications.store";
import { useAuthStore } from "../../stores/useAuthStore";
import NotificationBadge from "../ui/NotificationBadge";

interface AppHeaderProps {
  title: string;
  showBack?: boolean; 
  onBack?: () => void;       
  showMenu?: boolean; 
  onMenuPress?: () => void; 
  showHelp?: boolean; 
  white?: boolean; 
  onProfilePress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  onHomePress?: () => void;
  showSos?: boolean; 
}

const HIT_SLOP: Insets = { top: 15, bottom: 15, left: 15, right: 15 };

const AppHeader = ({ 
  title, 
  showBack = false, 
  onBack,                 
  showMenu = false,
  onMenuPress,            
  white = false,
  onProfilePress, 
  onHomePress,    
  rightIcon,      
  onRightPress,
  showSos = false 
}: AppHeaderProps) => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const user = useAuthStore((s) => s.user);
  const userRole = (user?.role || "citizen").toLowerCase();
  const unread = useNotificationStore((s) => s.list.filter((n) => !n.read).length);

  // 🎨 Identité visuelle par corps d'État (Niger e-Justice)
  const roleStyles = useMemo(() => {
    switch (userRole) {
      case "admin": 
        return { main: "#1E293B", content: "#FFFFFF" }; // Gris Charbon Admin
      case "officier_police": 
      case "commissaire": 
      case "inspecteur":
        return { main: "#1E3A8A", content: "#FFFFFF" }; // Bleu Police
      case "opj_gendarme":
      case "gendarme":
        return { main: "#065F46", content: "#FFFFFF" }; // Vert Gendarmerie
      case "judge":
      case "prosecutor":
      case "greffier": 
        return { main: "#7C2D12", content: "#FFFFFF" }; // Bordeaux Justice
      case "bailiff": 
      case "lawyer":
        return { main: "#4338CA", content: "#FFFFFF" }; // Indigo Auxiliaires
      default: 
        return { main: "#0891B2", content: "#FFFFFF" }; // Cyan Citoyen
    }
  }, [userRole]);

  const headerBg = white ? (isDark ? "#121212" : "#FFFFFF") : roleStyles.main;
  const iconAndTextColor = white ? (isDark ? "#FFFFFF" : theme.colors.text) : roleStyles.content;

  // 🏠 Routage Home intelligent pour éviter les erreurs de Navigator
  const handleHomeAction = () => {
    if (onHomePress) return onHomePress();
    
    const roleRoutes: Record<string, string> = {
      admin: "AdminHome", 
      officier_police: "PoliceHome",
      inspecteur: "PoliceHome",
      commissaire: "CommissaireDashboard",
      judge: "JudgeHome", 
      prosecutor: "ProsecutorHome",
      greffier: "ClerkHome",
      bailiff: "BailiffHome",
      citizen: "CitizenHome",
      lawyer: "LawyerTracking"
    };
    
    navigation.navigate(roleRoutes[userRole] || "CitizenHome");
  };

  const handleGoBack = () => {
    if (onBack) return onBack();
    navigation.canGoBack() ? navigation.goBack() : handleHomeAction();
  };

  const handleSos = () => {
    const msg = "URGENCE SOS\n\nVoulez-vous envoyer une alerte d'urgence immédiate aux forces de l'ordre ?";
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        window.alert("🚨 ALERTE ENVOYÉE : Géolocalisation transmise au PC Police.");
      }
    } else {
      Alert.alert("URGENCE SOS", msg, [
          { text: "Annuler", style: "cancel" },
          { 
            text: "ENVOYER", 
            style: "destructive", 
            onPress: () => Alert.alert("🚨 ALERTE ENVOYÉE", "Géolocalisation transmise au PC Police.") 
          }
        ]
      );
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: headerBg,
        paddingTop: insets.top, 
        borderBottomWidth: white ? 1 : 0,
        borderBottomColor: isDark ? "#222" : "#E2E8F0",
      },
      Platform.OS === 'web' && { top: 0, position: 'fixed' as any, left: 0, right: 0 }
    ]}>
      <StatusBar 
        barStyle={white && !isDark ? "dark-content" : "light-content"} 
        backgroundColor="transparent" 
        translucent 
      />

      <View style={styles.contentInner}>
        {/* GAUCHE : Retour ou Menu */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity onPress={handleGoBack} style={styles.iconButton} hitSlop={HIT_SLOP}>
              <Ionicons name="arrow-back" size={24} color={iconAndTextColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => onMenuPress ? onMenuPress() : navigation.dispatch(DrawerActions.toggleDrawer())} 
              style={styles.iconButton} 
              hitSlop={HIT_SLOP}
            >
              <Ionicons name="menu-sharp" size={28} color={iconAndTextColor} />
            </TouchableOpacity>
          )}
          <Text numberOfLines={1} style={[styles.title, { color: iconAndTextColor, marginLeft: 8 }]}>
            {title}
          </Text>
        </View>

        {/* DROITE : SOS, Home, Settings, Notifs, Profile */}
        <View style={styles.rightContainer}>
          
          {showSos && (
            <TouchableOpacity style={styles.sosBtn} onPress={handleSos} activeOpacity={0.8}>
              <Ionicons name="alert-circle" size={18} color="#FFF" />
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          )}

          {rightIcon && (
             <TouchableOpacity onPress={onRightPress} style={styles.iconButton} hitSlop={HIT_SLOP}>
               <Ionicons name={rightIcon as any} size={22} color={iconAndTextColor} />
             </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleHomeAction} style={styles.iconButton} hitSlop={HIT_SLOP}>
            <Ionicons name="home" size={22} color={iconAndTextColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate(userRole === 'admin' ? "AdminSettings" : "Settings")} 
            style={styles.iconButton} 
            hitSlop={HIT_SLOP}
          >
            <Ionicons name="settings-outline" size={22} color={iconAndTextColor} />
          </TouchableOpacity>

          {route.name !== "Notifications" && (
              <TouchableOpacity 
                onPress={() => navigation.navigate(userRole === 'admin' ? "AdminNotifications" : "Notifications")} 
                style={styles.iconButton} 
                hitSlop={HIT_SLOP}
              >
                  <Ionicons name="notifications" size={22} color={iconAndTextColor} />
                  {unread > 0 && <NotificationBadge count={unread} />}
              </TouchableOpacity>
          )}

          <TouchableOpacity 
              onPress={onProfilePress || (() => navigation.navigate("Profile"))} 
              style={[styles.profileButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              hitSlop={HIT_SLOP}
          >
            <Ionicons name="person" size={18} color={iconAndTextColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: '100%',
    zIndex: 1000,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contentInner: {
    height: 56, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  leftContainer: { flexDirection: "row", alignItems: "center", flex: 1.5 },
  rightContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", flex: 3.5, gap: 0 },
  iconButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center", position: 'relative' },
  profileButton: { 
    width: 32, height: 32, borderRadius: 16, 
    justifyContent: "center", alignItems: "center", marginLeft: 4, 
  },
  title: { fontWeight: "bold", fontSize: 16, letterSpacing: -0.5, flexShrink: 1 },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#DC2626", 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 4,
    gap: 3,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  sosText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 10
  }
});

export default AppHeader;