import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Switch, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView, 
  Platform,
  StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
// ✅ IMPORT NAVIGATION
import { useNavigation, CommonActions } from "@react-navigation/native";

// ✅ Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { getAppTheme } from "../../theme";
import { useAppTheme as useVisualTheme } from "../../theme/AppThemeProvider"; 

import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateMe } from "../../services/user.service";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { isDark, toggleTheme } = useVisualTheme(); 
  const institutionalTheme = getAppTheme();
  const primaryColor = institutionalTheme.color;

  const { user, setUser, logout } = useAuthStore();

  const [firstname, setFirstname] = useState(user?.firstname || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  const [telephone, setTelephone] = useState(user?.telephone || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setTelephone(user.telephone || "");
    }
  }, [user]);

  const initials = firstname && lastname 
    ? `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase() 
    : "U";

  const handleSave = async () => {
    if (!firstname.trim() || !lastname.trim()) {
      return Alert.alert("Champs requis", "L'identité complète est obligatoire.");
    }

    setLoading(true);
    try {
      const updatedUser = await updateMe({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        telephone: telephone.trim()
      });

      if (setUser) setUser(updatedUser as any); 
      
      Toast.show({
        type: 'success',
        text1: 'Profil mis à jour',
        text2: 'Vos informations ont été enregistrées.'
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIQUE DE DÉCONNEXION (VERSION FINALE & SÉCURISÉE)
  const handleLogout = async () => {
    console.log("🚪 Clic Déconnexion reçu");

    // 1. Nettoyage des données (avec protection erreur)
    try {
        await logout(); 
        console.log("✅ Store vidé");
    } catch (e) {
        console.log("⚠️ Erreur nettoyage store (ignorée):", e);
    }

    // 2. Navigation forcée
    // On essaie de reset vers 'Login'. Si ça échoue, on fait un simple navigate.
    try {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }], 
            })
        );
    } catch (err) {
        console.log("⚠️ Reset impossible, tentative navigation simple vers Login");
        // Fallback : Navigation simple si le reset est bloqué par la structure
        navigation.navigate('Login');
    }
  };

  const confirmLogout = () => {
    // Sur Web, on exécute directement car Alert est parfois bloquant
    if (Platform.OS === 'web') {
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
            handleLogout();
        }
    } else {
        Alert.alert(
          "Déconnexion",
          "Voulez-vous vraiment quitter l'application ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Se déconnecter", style: "destructive", onPress: handleLogout }
          ]
        );
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Paramètres" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollPadding, 
            { backgroundColor: isDark ? "#121212" : "#F8FAFC" }
          ]} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* 📸 SECTION AVATAR */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <TouchableOpacity style={styles.editBadge} activeOpacity={0.8}>
                    <Ionicons name="camera" size={14} color="#FFF" />
                </TouchableOpacity>
            </View>
            
            <Text style={[styles.userName, { color: isDark ? "#FFF" : "#1E293B" }]}>
                {firstname} {lastname}
            </Text>
            <Text style={[styles.userRole, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                {user?.role?.toUpperCase() || "UTILISATEUR"}
            </Text>
          </View>

          {/* 👤 INFORMATIONS MODIFIABLES */}
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>Mes Informations</Text>
          <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFF", borderColor: isDark ? "#333" : "#F1F5F9" }]}>
            <SettingInput label="Prénom" value={firstname} onChange={setFirstname} isDark={isDark} />
            <SettingInput label="Nom" value={lastname} onChange={setLastname} isDark={isDark} />
            <SettingInput label="Téléphone" value={telephone} onChange={setTelephone} isDark={isDark} keyboard="phone-pad" placeholder="+227..." />
            
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.saveBtn, { backgroundColor: primaryColor }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveText}>ENREGISTRER</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 🌓 PRÉFÉRENCES */}
          <Text style={[styles.sectionTitle, { color: primaryColor, marginTop: 30 }]}>Préférences</Text>
          <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFF", borderColor: isDark ? "#333" : "#F1F5F9" }]}>
            <View style={styles.row}>
              <View style={styles.rowLabel}>
                <View style={[styles.iconCircle, { backgroundColor: primaryColor + "15" }]}>
                    <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: isDark ? "#FFF" : "#1E293B" }]}>Mode Sombre</Text>
                </View>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme} 
                trackColor={{ false: "#CBD5E1", true: primaryColor }}
              />
            </View>
          </View>

          {/* 🛑 BOUTON DÉCONNEXION */}
          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2", borderColor: isDark ? "#450a0a" : "#FEE2E2" }]} 
            onPress={confirmLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

          {/* 🏛️ MENTIONS LÉGALES */}
          <View style={styles.footerBranding}>
              <Text style={[styles.versionText, { color: isDark ? "#FFF" : "#1E293B" }]}>e-Justice Niger</Text>
              <Text style={styles.legalText}>v1.5.0 • Ministère de la Justice</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      
      <SmartFooter />
    </ScreenContainer>
  );
}

// 🛠️ Composant Input
const SettingInput = ({ label, value, onChange, isDark, keyboard = "default", placeholder = "" }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
    <TextInput
      style={[
        styles.input, 
        { 
          backgroundColor: isDark ? "#121212" : "#F8FAFC", 
          color: isDark ? "#FFF" : "#1E293B", 
          borderColor: isDark ? "#444" : "#E2E8F0" 
        }
      ]}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
    />
  </View>
);

const styles = StyleSheet.create({
  scrollPadding: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 200 }, // ✅ Espace suffisant pour le footer
  
  // 📸 Styles Avatar
  avatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#FFF',
    elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5
  },
  avatarInitials: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#10B981', 
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF'
  },
  userName: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  userRole: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 4 },

  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  card: { padding: 22, borderRadius: 24, borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 15 },
  label: { fontSize: 16, fontWeight: "800", letterSpacing: -0.5 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  inputGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: "900", marginBottom: 8, marginLeft: 4, letterSpacing: 1, color: "#94A3B8" },
  input: { borderRadius: 16, padding: 16, borderWidth: 1.5, fontSize: 16, fontWeight: '700' },
  
  saveBtn: { height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 6 },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60, borderRadius: 20, marginTop: 40, gap: 12, borderWidth: 1 },
  logoutText: { color: "#EF4444", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  
  footerBranding: { marginTop: 45, alignItems: 'center' },
  versionText: { fontSize: 13, fontWeight: '900', letterSpacing: -0.2 },
  legalText: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: '600' }
});