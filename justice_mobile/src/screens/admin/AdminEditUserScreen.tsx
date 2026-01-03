import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, ScrollView, Switch, Platform, ViewStyle, Image,
  KeyboardAvoidingView, StatusBar
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons"; 
import * as ImagePicker from 'expo-image-picker';
import * as ExpoClipboard from 'expo-clipboard'; 

// Services
import { getUserById, updateUser } from "../../services/user.service";
import { getAllCourts } from "../../services/admin.service"; 
import { getAllStations } from "../../services/policeStation.service";

// Architecture & Thème
import { AdminScreenProps } from "../../types/navigation";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

export default function AdminEditUserScreen({ navigation, route }: AdminScreenProps<'AdminEditUser'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();
  const userId = route.params?.userId; 

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
    passBox: isDark ? "#064E3B" : "#F0FDF4",
    passText: isDark ? "#4ADE80" : "#15803D"
  };

  const ROLES = [
    { label: "Citoyen", value: "citizen", icon: "person-outline", color: "#64748B" },
    { label: "Police", value: "police", icon: "shield-outline", color: "#2563EB" },
    { label: "Commissaire", value: "commissaire", icon: "ribbon-outline", color: "#1E40AF" },
    { label: "Procureur", value: "prosecutor", icon: "briefcase-outline", color: "#8B5CF6" },
    { label: "Juge", value: "judge", icon: "hammer-outline", color: "#7C3AED" },
    { label: "Greffier", value: "clerk", icon: "document-text-outline", color: "#0D9488" },
    { label: "Admin", value: "admin", icon: "key-outline", color: "#EF4444" },
  ];

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "",
    registrationNumber: "", 
    role: "citizen",
    selectedStructureId: null as number | null,
    isActive: true,
    photo: null as string | null
  });

  const [newPassword, setNewPassword] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const isJusticeRole = ['prosecutor', 'judge', 'clerk'].includes(form.role);
  const isSecurityRole = ['police', 'commissaire'].includes(form.role);

  const { data: courts } = useQuery({
    queryKey: ['courts'],
    queryFn: getAllCourts,
    enabled: isJusticeRole
  });

  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: getAllStations,
    enabled: isSecurityRole
  });

  useEffect(() => {
    if (user) {
      const u = (user as any).data || user;
      setForm({
        firstname: u.firstname || "",
        lastname: u.lastname || "",
        email: u.email || "",
        telephone: u.telephone || "",
        registrationNumber: u.matricule || u.registrationNumber || "", 
        role: u.role || "citizen",
        selectedStructureId: u.courtId || u.policeStationId || (u.Court?.id) || (u.PoliceStation?.id) || null,
        isActive: u.status === 'active' || u.isActive === true,
        photo: u.photo || u.avatar || null
      });
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Erreur", "Permission refusée");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
        setForm({ ...form, photo: result.assets[0].uri });
    }
  };

  const generatePassword = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    let pass = "";
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
    
    try {
        await ExpoClipboard.setStringAsync(pass);
        Alert.alert("Sécurité", `Nouveau mot de passe : ${pass}\n\nCopié dans le presse-papier.`);
    } catch (e) {
        Alert.alert("Mot de passe", `Notez bien ce code : ${pass}`);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUser(userId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["user", userId] });
      
      if (Platform.OS === 'web') {
          window.alert("Modifications enregistrées avec succès.");
          navigation.navigate('AdminUsers'); 
      } else {
          Alert.alert("Succès", "Profil mis à jour.", [{ text: "Continuer", onPress: () => navigation.navigate('AdminUsers') }]);
      }
    }
  });

  const handleSave = () => {
    const payload: any = { 
      lastname: form.lastname.toUpperCase().trim(),
      firstname: form.firstname.trim(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone,
      matricule: form.registrationNumber,
      role: form.role,
      status: form.isActive ? 'active' : 'inactive',
      courtId: isJusticeRole && form.selectedStructureId ? Number(form.selectedStructureId) : null,
      policeStationId: isSecurityRole && form.selectedStructureId ? Number(form.selectedStructureId) : null,
      photo: form.photo
    };
    if (newPassword) payload.password = newPassword;
    updateMutation.mutate(payload);
  };

  if (isLoading) return (
    <ScreenContainer withPadding={false}>
        <AppHeader title="Chargement..." showBack={true} />
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}><ActivityIndicator size="large" color={primaryColor} /></View>
    </ScreenContainer>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Fiche Agent" showBack={true} />
      
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
          {/* PHOTO SECTION */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.photoFrame, { borderColor: primaryColor, backgroundColor: colors.bgCard }]} 
              onPress={pickImage}
            >
              {form.photo ? (
                <Image source={{ uri: form.photo }} style={styles.fullImage} />
              ) : (
                <Ionicons name="camera-outline" size={40} color={primaryColor} />
              )}
            </TouchableOpacity>
            <Text style={[styles.photoLabel, { color: colors.textSub }]}>IDENTITÉ VISUELLE</Text>
          </View>

          {/* STATUS SWITCH */}
          <View style={[styles.statusCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={[styles.statusDot, { backgroundColor: form.isActive ? "#10B981" : "#EF4444" }]} />
              <Text style={[styles.statusTitle, { color: colors.textMain }]}>{form.isActive ? "COMPTE ACTIF" : "ACCÈS RÉVOQUÉ"}</Text>
            </View>
            <Switch 
              value={form.isActive} 
              onValueChange={(v) => setForm({ ...form, isActive: v })} 
              thumbColor="#FFF"
              trackColor={{ false: "#CBD5E1", true: "#10B981" }}
            />
          </View>

          {/* IDENTITÉ */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>État Civil & Matricule</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Prénom</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} 
                value={form.firstname} 
                onChangeText={(t) => setForm({ ...form, firstname: t })} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Nom</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} 
                value={form.lastname} 
                onChangeText={(t) => setForm({ ...form, lastname: t.toUpperCase() })} 
              />
            </View>
          </View>

          {form.role !== 'citizen' && (
            <View style={{ marginBottom: 15 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Numéro de Matricule</Text>
              <TextInput 
                style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} 
                value={form.registrationNumber} 
                onChangeText={(t) => setForm({ ...form, registrationNumber: t })} 
                autoCapitalize="characters"
              />
            </View>
          )}

          <Text style={[styles.label, { color: colors.textSub }]}>Courriel Professionnel</Text>
          <TextInput 
            style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} 
            value={form.email} 
            onChangeText={(t) => setForm({ ...form, email: t })} 
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* SÉCURITÉ */}
          <View style={styles.passwordContainer}>
                <View style={styles.rowBetween}>
                    <Text style={[styles.label, { color: colors.textSub }]}>Identifiants de Sécurité</Text>
                </View>
                
                <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[styles.generateBtn, { borderColor: primaryColor }]} 
                    onPress={generatePassword}
                >
                    <Ionicons name="key-outline" size={20} color={primaryColor} />
                    <Text style={[styles.generateText, { color: primaryColor }]}>Générer un nouveau mot de passe</Text>
                </TouchableOpacity>

                {newPassword !== "" && (
                    <View style={[styles.generatedPasswordBox, { backgroundColor: colors.passBox, borderColor: colors.passText + "40" }]}>
                        <Text style={[styles.generatedPasswordText, { color: colors.passText }]}>{newPassword}</Text>
                        <Text style={[styles.passwordNote, { color: colors.passText }]}>Secret copié au presse-papier</Text>
                    </View>
                )}
          </View>

          {/* RÔLES */}
          <Text style={[styles.sectionTitle, { marginTop: 20, color: colors.textSub }]}>Affectation des Pouvoirs</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => (
              <TouchableOpacity 
                key={r.value} 
                activeOpacity={0.8}
                style={[styles.roleChip, { backgroundColor: form.role === r.value ? r.color : colors.bgCard, borderColor: colors.border }]} 
                onPress={() => setForm({ ...form, role: r.value, selectedStructureId: null })}
              >
                <Ionicons name={r.icon as any} size={14} color={form.role === r.value ? "#FFF" : r.color} />
                <Text style={[styles.roleChipText, { color: form.role === r.value ? "#FFF" : colors.textMain }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AFFECTATION */}
          {(isJusticeRole || isSecurityRole) && (
            <View style={{ marginTop: 25 }}>
              <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Unité de Rattachement</Text>
              <View style={styles.structureList}>
                {((isSecurityRole ? stations : courts) || []).map((item: any) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.structItem, { 
                      backgroundColor: colors.bgCard, 
                      borderColor: form.selectedStructureId === item.id ? primaryColor : colors.border 
                    }]}
                    onPress={() => setForm({ ...form, selectedStructureId: item.id })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 11, marginTop: 2 }}>{item.city || "Juridiction"}</Text>
                    </View>
                    {form.selectedStructureId === item.id && <Ionicons name="checkmark-circle" size={24} color={primaryColor} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.saveBtn, { backgroundColor: primaryColor }]} 
            onPress={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <ActivityIndicator color="#FFF" /> : (
                <>
                    <Text style={styles.saveText}>METTRE À JOUR LA FICHE</Text>
                    <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                </>
            )}
          </TouchableOpacity>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  photoSection: { alignItems: 'center', marginBottom: 25 },
  photoFrame: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoLabel: { fontSize: 10, marginTop: 8, fontWeight: '900', letterSpacing: 1 },
  fullImage: { width: '100%', height: '100%' },
  statusCard: { padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, marginBottom: 25 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusTitle: { fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, textTransform: "uppercase", letterSpacing: 1.5 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontWeight: '700', borderWidth: 1.5 },
  inputFull: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontWeight: '700', marginBottom: 15, borderWidth: 1.5 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  roleChipText: { fontSize: 11, fontWeight: '800', marginLeft: 8 },
  structureList: { gap: 10 },
  structItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 18, borderWidth: 2, alignItems: 'center' },
  saveBtn: { 
    height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 35, gap: 12, flexDirection: 'row',
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10 }, android: { elevation: 6 } })
  },
  saveText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  passwordContainer: { marginTop: 10, marginBottom: 15 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16, gap: 10 },
  generateText: { fontWeight: '800', fontSize: 12 },
  generatedPasswordBox: { marginTop: 12, padding: 15, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 4 },
  generatedPasswordText: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  passwordNote: { fontSize: 10, fontWeight: '700' }
});