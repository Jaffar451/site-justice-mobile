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

// ✅ 1. Imports Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { getAppTheme } from "../../theme";
// AJOUT : Import du hook pour gérer le mode sombre
import { useAppTheme as useVisualTheme } from "../../theme/AppThemeProvider"; 

import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateMe } from "../../services/user.service";

export default function SettingsScreen() {
  // ✅ 2. Thème Visuel (Sombre/Clair) vs Thème de Rôle (Couleur)
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

  /**
   * 💾 ENREGISTREMENT DES MODIFICATIONS
   */
  const handleSave = async () => {
    if (!firstname.trim() || !lastname.trim()) {
      return Alert.alert("Champs requis", "L'identité complète est obligatoire pour la validité des actes judiciaires.");
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
        text1: 'Profil synchronisé',
        text2: 'Vos informations ont été mises à jour avec succès.'
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de joindre le serveur central. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous fermer votre session sécurisée ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Quitter", style: "destructive", onPress: logout }
      ]
    );
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
          
          {/* 🌓 APPARENCE ET SYSTÈME */}
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>Configuration Appareil</Text>
          <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFF", borderColor: isDark ? "#333" : "#F1F5F9" }]}>
            <View style={styles.row}>
              <View style={styles.rowLabel}>
                <View style={[styles.iconCircle, { backgroundColor: primaryColor + "15" }]}>
                    <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: isDark ? "#FFF" : "#1E293B" }]}>Mode Sombre</Text>
                    <Text style={[styles.subLabel, { color: isDark ? "#94A3B8" : "#64748B" }]}>Confort visuel pour usage nocturne</Text>
                </View>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme} 
                trackColor={{ false: "#CBD5E1", true: primaryColor }}
              />
            </View>
          </View>

          {/* 👤 IDENTITÉ DE L'AGENT / CITOYEN */}
          <Text style={[styles.sectionTitle, { color: primaryColor, marginTop: 35 }]}>Informations de Compte</Text>
          <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFF", borderColor: isDark ? "#333" : "#F1F5F9" }]}>
            <SettingInput 
                label="Prénom" 
                value={firstname} 
                onChange={setFirstname} 
                isDark={isDark} 
            />
            <SettingInput 
                label="Nom" 
                value={lastname} 
                onChange={setLastname} 
                isDark={isDark} 
            />
            <SettingInput 
                label="Numéro de Contact" 
                value={telephone} 
                onChange={setTelephone} 
                isDark={isDark}
                keyboard="phone-pad" 
                placeholder="+227 00 00 00 00" 
            />
            
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
                  <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.saveText}>ENREGISTRER LES MODIFICATIONS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 🛑 DECONNEXION */}
          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2" }]} 
            onPress={confirmLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Fermer la session sécurisée</Text>
          </TouchableOpacity>

          {/* 🏛️ MENTIONS LÉGALES */}
          <View style={styles.footerBranding}>
              <Text style={[styles.versionText, { color: isDark ? "#FFF" : "#1E293B" }]}>e-Justice République du Niger</Text>
              <Text style={styles.legalText}>Plateforme sécurisée du Ministère de la Justice</Text>
              <Text style={styles.legalText}>Version 1.5.0 • DIM/MJ</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      
      <SmartFooter />
    </ScreenContainer>
  );
}

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
  scrollPadding: { paddingHorizontal: 20, paddingBottom: 140 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  card: { padding: 22, borderRadius: 24, borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 15 },
  label: { fontSize: 16, fontWeight: "800", letterSpacing: -0.5 },
  subLabel: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  inputGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: "900", marginBottom: 8, marginLeft: 4, letterSpacing: 1, color: "#94A3B8" },
  input: { borderRadius: 16, padding: 16, borderWidth: 1.5, fontSize: 16, fontWeight: '700' },
  saveBtn: { height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 6 },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60, borderRadius: 20, marginTop: 40, gap: 12, borderWidth: 1, borderColor: "#FEE2E2" },
  logoutText: { color: "#EF4444", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  footerBranding: { marginTop: 45, alignItems: 'center' },
  versionText: { fontSize: 13, fontWeight: '900', letterSpacing: -0.2 },
  legalText: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: '600' }
});