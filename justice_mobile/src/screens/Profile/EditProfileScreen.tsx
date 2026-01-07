import React, { useState, useMemo, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Text,
  StatusBar
} from "react-native";
import { TextInput, Button, SegmentedButtons, Surface } from "react-native-paper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { updateProfile, getProfile } from "../../services/auth.service";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import { useAppTheme } from "../../theme/AppThemeProvider";

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuthStore();
  const { isDark } = useAppTheme();
  const queryClient = useQueryClient();

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
      case "commissaire": 
      case "officier_police": return "#1E3A8A";
      case "judge": return "#7C2D12";
      default: return "#059669"; // Vert e-Justice pour citoyen
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
      
      // Invalider le cache pour forcer le rafraîchissement partout
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      if (Platform.OS === 'web') {
          window.alert("✅ Profil mis à jour !");
          navigation.goBack();
      } else {
          Alert.alert("Succès", "Profil mis à jour avec succès.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || err.message || "Échec de la mise à jour.";
      Alert.alert("Erreur", errorMsg);
    }
  });

  const handleSave = () => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
        Alert.alert("Champs requis", "Veuillez remplir au moins le nom, le prénom et l'email.");
        return;
    }
    mutation.mutate(form as any);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Éditer mon Profil" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
            style={{ backgroundColor: colors.bgMain }} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
          
          <View style={[styles.headerBackground, { backgroundColor: roleColor }]}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.4)' }]}>
                    <Text style={styles.avatarText}>
                        {(form.firstname?.[0] || "")}{(form.lastname?.[0] || "")}
                    </Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>{form.firstname} {form.lastname}</Text>
              <Text style={styles.headerRole}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
          </View>

          <Surface style={[styles.formCard, { backgroundColor: colors.bgCard }]} elevation={2}>
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>ÉTAT CIVIL</Text>

            <View style={{ marginBottom: 20 }}>
                <SegmentedButtons
                    value={form.gender}
                    onValueChange={(val) => setForm({ ...form, gender: val })}
                    buttons={[
                      { value: 'M', label: 'Homme', icon: 'face-man', checkedColor: '#FFF', style: form.gender === 'M' ? {backgroundColor: roleColor} : {} },
                      { value: 'F', label: 'Femme', icon: 'face-woman', checkedColor: '#FFF', style: form.gender === 'F' ? {backgroundColor: roleColor} : {} },
                    ]}
                />
            </View>

            <View style={styles.row}>
                <TextInput
                    label="Prénom"
                    value={form.firstname}
                    onChangeText={(t) => setForm({ ...form, firstname: t })}
                    style={[styles.input, { flex: 1, marginRight: 10, backgroundColor: colors.inputBg }]}
                    mode="outlined"
                    activeOutlineColor={roleColor}
                    textColor={colors.textMain}
                />
                <TextInput
                    label="Nom"
                    value={form.lastname}
                    onChangeText={(t) => setForm({ ...form, lastname: t })}
                    style={[styles.input, { flex: 1, backgroundColor: colors.inputBg }]}
                    mode="outlined"
                    activeOutlineColor={roleColor}
                    textColor={colors.textMain}
                />
            </View>

            <TextInput
                label="N° CNI / Passeport"
                value={form.cni}
                onChangeText={(t) => setForm({ ...form, cni: t })}
                style={[styles.input, { backgroundColor: colors.inputBg, marginTop: 15 }]}
                mode="outlined"
                activeOutlineColor={roleColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="card-account-details-outline" color={roleColor} />}
            />

            <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>COORDONNÉES</Text>

            <TextInput
                label="Email"
                value={form.email}
                keyboardType="email-address"
                onChangeText={(t) => setForm({ ...form, email: t })}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                mode="outlined"
                activeOutlineColor={roleColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="email-outline" color={roleColor} />}
            />

            <TextInput
                label="Téléphone"
                value={form.telephone}
                keyboardType="phone-pad"
                onChangeText={(t) => setForm({ ...form, telephone: t })}
                style={[styles.input, { backgroundColor: colors.inputBg, marginTop: 15 }]}
                mode="outlined"
                activeOutlineColor={roleColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="phone-outline" color={roleColor} />}
            />

            <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>ADRESSE & VILLE</Text>

            <View style={styles.row}>
                <TextInput
                    label="Ville"
                    value={form.city}
                    onChangeText={(t) => setForm({ ...form, city: t })}
                    style={[styles.input, { flex: 1, marginRight: 10, backgroundColor: colors.inputBg }]}
                    mode="outlined"
                    activeOutlineColor={roleColor}
                    textColor={colors.textMain}
                />
                <TextInput
                    label="Adresse"
                    value={form.address}
                    onChangeText={(t) => setForm({ ...form, address: t })}
                    style={[styles.input, { flex: 2, backgroundColor: colors.inputBg }]}
                    mode="outlined"
                    activeOutlineColor={roleColor}
                    textColor={colors.textMain}
                    placeholder="Quartier, Rue..."
                />
            </View>

            <Button 
                mode="contained" 
                onPress={handleSave} 
                loading={mutation.isPending}
                disabled={mutation.isPending}
                style={{ backgroundColor: roleColor, borderRadius: 12, marginTop: 30 }}
                contentStyle={{ height: 54 }}
                labelStyle={{ fontWeight: '900', letterSpacing: 1 }}
            >
                ENREGISTRER LES MODIFICATIONS
            </Button>
          </Surface>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  headerBackground: { alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  headerRole: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '800', marginTop: 4, letterSpacing: 1 },
  formCard: { marginHorizontal: 20, marginTop: -30, borderRadius: 24, padding: 20 },
  sectionTitle: { fontSize: 10, fontWeight: "900", marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { fontSize: 15 },
});