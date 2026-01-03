import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ViewStyle,
  KeyboardTypeOptions,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";

// ✅ 1. Architecture & Thème
import { AdminScreenProps } from "../../types/navigation";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { useAuthStore } from "../../stores/useAuthStore";
import { saveUser } from "../../utils/secureStorage";

// Services
import { updateMe } from "../../services/user.service";
import { logAdminAction } from "../../services/audit.service";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// --- COMPOSANT INTERNE OPTIMISÉ ---
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboard?: KeyboardTypeOptions;
  editable?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  primaryColor: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  colors: any;
  isDark: boolean;
}

const InputField = React.memo(({ 
  label, value, onChangeText, keyboard = "default", 
  editable = true, icon, primaryColor, autoCapitalize, colors, isDark 
}: InputFieldProps) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, { color: colors.textSub }]}>{label}</Text>
    <View style={[
      styles.inputContainer, 
      { 
        backgroundColor: colors.inputBg, 
        borderColor: colors.border,
        opacity: editable ? 1 : 0.6 
      }
    ]}>
      <Ionicons name={icon} size={20} color={primaryColor} style={{ marginRight: 12 }} />
      <TextInput
        style={[styles.input, { color: colors.textMain }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboard}
        editable={editable}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
      />
      {!editable && <Ionicons name="lock-closed" size={16} color={colors.textSub} />}
    </View>
  </View>
));

export default function AdminEditProfileScreen({ navigation }: AdminScreenProps<'AdminEditProfile'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;

  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
  };

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    telephone: "",
    email: "",
    matricule: "", 
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        telephone: user.telephone || "",
        email: user.email || "",
        matricule: (user as any).matricule || (user as any).registrationNumber || "ADMIN-SYS",
      });
    }
  }, [user]);

  const handleSave = async () => {
    const cleanFirstname = form.firstname.trim();
    const cleanLastname = form.lastname.trim().toUpperCase();
    const cleanTelephone = form.telephone.trim();

    if (!cleanLastname || !cleanFirstname) {
      Alert.alert("Champs requis", "L'identité complète est nécessaire pour la traçabilité.");
      return;
    }

    setLoading(true);
    try {
      const updatedData = await updateMe({
        firstname: cleanFirstname,
        lastname: cleanLastname,
        telephone: cleanTelephone,
      });

      const fullUpdatedUser = { ...user, ...updatedData };
      await saveUser(fullUpdatedUser as any);
      setUser(fullUpdatedUser as any);

      await logAdminAction(
        "PROFILE_UPDATED",
        user?.id || 0,
        `Mise à jour du profil administrateur`
      );

      Alert.alert("Succès", "Votre profil a été mis à jour avec succès.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert("Échec", "Erreur lors de la synchronisation avec le serveur MJ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Édition du Profil" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1, backgroundColor: colors.bgMain }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
          {/* Section Avatar */}
          <View style={styles.headerSection}>
            <View style={[styles.avatarCircle, { backgroundColor: primaryColor + "15" }]}>
              <Ionicons name="person-circle-outline" size={100} color={primaryColor} />
            </View>
            <View style={styles.badgeRow}>
              <Text style={[styles.roleBadge, { color: primaryColor, backgroundColor: primaryColor + "15" }]}>
                {user?.role?.toUpperCase() || "ADMINISTRATEUR"}
              </Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.formCard}>
            <InputField 
              label="NOM DE FAMILLE" 
              value={form.lastname} 
              onChangeText={(t) => setForm(prev => ({ ...prev, lastname: t }))}
              icon="id-card-outline"
              primaryColor={primaryColor}
              autoCapitalize="characters"
              colors={colors}
              isDark={isDark}
            />
            <InputField 
              label="PRÉNOM" 
              value={form.firstname} 
              onChangeText={(t) => setForm(prev => ({ ...prev, firstname: t }))}
              icon="person-outline"
              primaryColor={primaryColor}
              autoCapitalize="words"
              colors={colors}
              isDark={isDark}
            />
            <InputField 
              label="TÉLÉPHONE" 
              value={form.telephone} 
              onChangeText={(t) => setForm(prev => ({ ...prev, telephone: t }))}
              keyboard="phone-pad"
              icon="call-outline"
              primaryColor={primaryColor}
              colors={colors}
              isDark={isDark}
            />
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <InputField 
              label="EMAIL (IDENTIFIANT)" 
              value={form.email} 
              editable={false} 
              icon="mail-outline"
              primaryColor={primaryColor}
              colors={colors}
              isDark={isDark}
            />
            <InputField 
              label="MATRICULE AGENT" 
              value={form.matricule} 
              editable={false} 
              icon="barcode-outline"
              primaryColor={primaryColor}
              colors={colors}
              isDark={isDark}
            />
          </View>

          {/* Bouton de sauvegarde */}
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: primaryColor }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={styles.btnRow}>
                <Text style={styles.saveText}>ENREGISTRER LES MODIFICATIONS</Text>
                <Ionicons name="checkmark-done-circle-outline" size={24} color="#fff" style={{ marginLeft: 10 }} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 }, 
  headerSection: { alignItems: "center", marginBottom: 35 },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  roleBadge: { fontSize: 10, fontWeight: "900", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, letterSpacing: 1 },
  formCard: { gap: 4 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, height: 64 },
  input: { flex: 1, fontSize: 16, fontWeight: "700" },
  
  divider: { height: 1, marginVertical: 25, opacity: 0.5 },
  
  saveBtn: { 
    marginTop: 25, 
    height: 64, 
    borderRadius: 22, 
    justifyContent: "center", 
    alignItems: "center",
    ...Platform.select({
      android: { elevation: 6 },
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      web: { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" }
    })
  } as ViewStyle,
  btnRow: { flexDirection: 'row', alignItems: 'center' },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  footerSpacing: { height: 140 }
});