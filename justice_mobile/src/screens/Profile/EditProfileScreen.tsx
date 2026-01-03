import React, { useState, useMemo, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  Text,
  StatusBar
} from "react-native";
import { TextInput, Button, ActivityIndicator, SegmentedButtons } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";

// Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { updateProfile, getProfile } from "../../services/auth.service";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import { useAppTheme } from "../../theme/AppThemeProvider";

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuthStore();
  const { theme, isDark } = useAppTheme();

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  const roleColor = useMemo(() => {
    const role = (user?.role || "citizen").toLowerCase();
    switch (role) {
      case "admin": return "#1E293B";
      case "police": 
      case "commissaire": return "#1E3A8A";
      case "judge": return "#7C2D12";
      default: return "#0891B2";
    }
  }, [user?.role]);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "",
    address: "",
    city: "",
    cni: "",
    gender: "M",
  });

  const { data: fullProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (fullProfile) {
        setForm({
            firstname: fullProfile.firstname || user?.firstname || "",
            lastname: fullProfile.lastname || user?.lastname || "",
            email: fullProfile.email || user?.email || "",
            telephone: fullProfile.telephone || user?.telephone || "",
            address: fullProfile.address || "",
            city: fullProfile.city || "",
            cni: fullProfile.cni || "",
            gender: fullProfile.gender || "M",
        });
    }
  }, [fullProfile, user]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      const newUser = updatedUser.data || updatedUser; 
      setUser({ ...user, ...newUser });
      if (Platform.OS === 'web') {
          window.alert("✅ Profil mis à jour !");
          navigation.goBack();
      } else {
          Alert.alert("Succès", "Profil mis à jour.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    },
    onError: (err: any) => {
      Alert.alert("Erreur", err.message || "Échec de la mise à jour.");
    }
  });

  const handleSave = () => {
    if (!form.firstname || !form.lastname || !form.email) return;
    mutation.mutate(form as any);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Modifier mes infos" showBack={true} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ backgroundColor: colors.bgMain }} contentContainerStyle={styles.scrollContent}>
          
          <View style={[styles.headerBackground, { backgroundColor: roleColor }]}>
             <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                    <Text style={styles.avatarText}>{form.firstname?.[0]}{form.lastname?.[0]}</Text>
                </View>
             </View>
             <Text style={styles.headerTitle}>{form.firstname} {form.lastname}</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>INFORMATIONS PERSONNELLES</Text>

            <View style={{ marginBottom: 20 }}>
                <SegmentedButtons
                    value={form.gender}
                    onValueChange={(val) => setForm({ ...form, gender: val })}
                    buttons={[
                      { value: 'M', label: 'Homme', icon: 'face-man' },
                      { value: 'F', label: 'Femme', icon: 'face-woman' },
                    ]}
                    theme={{ colors: { outline: colors.border } }}
                />
            </View>

            <View style={styles.row}>
                <TextInput
                    label="Prénom"
                    value={form.firstname}
                    onChangeText={(t) => setForm({ ...form, firstname: t })}
                    style={[styles.input, { flex: 1, marginRight: 10, backgroundColor: colors.inputBg }]}
                    mode="outlined"
                    outlineColor={colors.border}
                    activeOutlineColor={roleColor}
                    textColor={colors.textMain}
                />
                <TextInput
                    label="Nom"
                    value={form.lastname}
                    onChangeText={(t) => setForm({ ...form, lastname: t })}
                    style={[styles.input, { flex: 1, backgroundColor: colors.inputBg }]}
                    mode="outlined"
                    outlineColor={colors.border}
                    activeOutlineColor={roleColor}
                    textColor={colors.textMain}
                />
            </View>

            <TextInput
                label="Numéro CNI / Passeport"
                value={form.cni}
                onChangeText={(t) => setForm({ ...form, cni: t })}
                style={[styles.input, { backgroundColor: colors.inputBg, marginTop: 15 }]}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={roleColor}
                textColor={colors.textMain}
                // ✅ FIX : Utilisation de "color" au lieu de "iconColor"
                left={<TextInput.Icon icon="card-account-details-outline" color={roleColor} />}
            />

            <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>CONTACT & LOCALISATION</Text>

            <TextInput
                label="Email"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={roleColor}
                textColor={colors.textMain}
                // ✅ FIX : Utilisation de "color" au lieu de "iconColor"
                left={<TextInput.Icon icon="email-outline" color={roleColor} />}
            />

            <TextInput
                label="Téléphone"
                value={form.telephone}
                onChangeText={(t) => setForm({ ...form, telephone: t })}
                style={[styles.input, { backgroundColor: colors.inputBg, marginTop: 15 }]}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={roleColor}
                textColor={colors.textMain}
                // ✅ FIX : Utilisation de "color" au lieu de "iconColor"
                left={<TextInput.Icon icon="phone-outline" color={roleColor} />}
            />

            <View style={styles.actionsContainer}>
                <Button 
                    mode="contained" 
                    onPress={handleSave} 
                    loading={mutation.isPending}
                    style={{ backgroundColor: roleColor, borderRadius: 12, marginTop: 20 }}
                    contentStyle={{ height: 50 }}
                >
                    ENREGISTRER
                </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBackground: { alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  formCard: { marginHorizontal: 20, marginTop: -30, borderRadius: 20, padding: 20, elevation: 4 },
  sectionTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 },
  row: { flexDirection: 'row' },
  input: { fontSize: 14 },
  actionsContainer: { marginTop: 10 }
});