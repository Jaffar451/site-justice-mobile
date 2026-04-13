import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, ScrollView, Switch, Platform, Image,
  KeyboardAvoidingView, StatusBar
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons"; 
import * as ImagePicker from 'expo-image-picker';
import * as ExpoClipboard from 'expo-clipboard'; 

import { getUserById, updateUser } from "../../services/user.service";
import { getAllCourts } from "../../services/court.service"; 
import { getAllStations } from "../../services/policeStation.service";
import { AdminScreenProps } from "../../types/navigation";
import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

export default function AdminEditUserScreen({ navigation, route }: AdminScreenProps<'AdminEditUser'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  // ✅ 1. VÉRIFIER userId
  const userId = useMemo(() => {
    const id = route.params?.userId;
    if (!id || isNaN(Number(id))) return null;
    return Number(id);
  }, [route.params?.userId]);

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
    { label: "Police", value: "officier_police", icon: "shield-outline", color: "#2563EB" },
    { label: "Commissaire", value: "commissaire", icon: "ribbon-outline", color: "#1E40AF" },
    { label: "Procureur", value: "prosecutor", icon: "briefcase-outline", color: "#8B5CF6" },
    { label: "Juge", value: "judge", icon: "hammer-outline", color: "#7C3AED" },
    { label: "Greffier", value: "greffier", icon: "document-text-outline", color: "#0D9488" },
    { label: "Admin", value: "admin", icon: "key-outline", color: "#EF4444" },
  ];

  // ✅ NOUVEAUX CHAMPS AJOUTÉS
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    personalEmail: "",
    telephone: "",
    alternativePhone: "",
    registrationNumber: "", 
    role: "citizen",
    selectedStructureId: null as number | null,
    isActive: true,
    photo: null as string | null,
    address: "",
    city: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    cin: "",
  });

  const [newPassword, setNewPassword] = useState("");

  // ✅ 2. REQUÊTE USER - CORRECTION: data: user (ligne 76)
  const { data: user, isLoading, error: loadError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
    retry: 1,
  });

  // ✅ 3. SÉPARATION Justice vs Police
  const isJusticeRole = useMemo(() => 
    ['prosecutor', 'judge', 'greffier'].includes(form.role), 
    [form.role]
  );
  
  const isSecurityRole = useMemo(() => 
    ['officier_police', 'commissaire'].includes(form.role), 
    [form.role]
  );

  // ✅ 4. REQUÊTES SÉPARÉES - CORRECTION: data: courts/stations (lignes 93, 99)
  const { data: courts } = useQuery({ 
    queryKey: ['courts'], 
    queryFn: getAllCourts, 
    enabled: isJusticeRole,
  });
  
  const { data: stations } = useQuery({ 
    queryKey: ['stations'], 
    queryFn: getAllStations, 
    enabled: isSecurityRole,
  });

  // ✅ 5. HYDRATATION FORMULAIRE
  useEffect(() => {
    if (!user) return;
    const u = (user as any).data || user;
    setForm({
      firstname: u.firstname || "",
      lastname: u.lastname || "",
      email: u.email || "",
      personalEmail: u.personalEmail || "",
      telephone: u.telephone || "",
      alternativePhone: u.alternativePhone || "",
      registrationNumber: u.matricule || u.registrationNumber || "", 
      role: u.role || "citizen",
      selectedStructureId: u.courtId || u.policeStationId || u.Court?.id || u.PoliceStation?.id || null,
      isActive: u.status === 'active' || u.isActive === true,
      photo: u.photo || u.avatar || null,
      address: u.address || "",
      city: u.city || "",
      dateOfBirth: u.dateOfBirth || "",
      placeOfBirth: u.placeOfBirth || "",
      nationality: u.nationality || "",
      cin: u.cin || "",
    });
  }, [user]);

  // ✅ 6. ACTIONS
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Erreur", "Permission refusée");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setForm(f => ({ ...f, photo: result.assets[0].uri }));
    }
  };

  const generatePassword = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
    try {
      await ExpoClipboard.setStringAsync(pass);
      Alert.alert("Sécurité", `Nouveau mot de passe : ${pass}\n\nCopié dans le presse-papier.`);
    } catch (e) {
      Alert.alert("Mot de passe", `Notez bien ce code : ${pass}`);
    }
  };

  // ✅ 7. MUTATION - CORRECTION: (data: any) (ligne 158)
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUser(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      if (Platform.OS === 'web') {
        window.alert("Modifications enregistrées avec succès.");
        navigation.replace('AdminUsers'); 
      } else {
        Alert.alert("Succès", "Profil mis à jour.", [
          { text: "Continuer", onPress: () => navigation.replace('AdminUsers') }
        ]);
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Erreur lors de la mise à jour.";
      if (Platform.OS === 'web') {
        window.alert(`Erreur : ${msg}`);
      } else {
        Alert.alert("Erreur", msg);
      }
    },
  });

  // ✅ 8. HANDLE SAVE
  const handleSave = useCallback(() => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
      Alert.alert("Champs manquants", "Prénom, nom et email sont obligatoires.");
      return;
    }
    const payload: any = { 
      lastname: form.lastname.toUpperCase().trim(),
      firstname: form.firstname.trim(),
      email: form.email.trim().toLowerCase(),
      personalEmail: form.personalEmail ? form.personalEmail.trim().toLowerCase() : null,
      telephone: form.telephone,
      alternativePhone: form.alternativePhone,
      matricule: form.registrationNumber,
      role: form.role,
      status: form.isActive ? 'active' : 'inactive',
      courtId: isJusticeRole && form.selectedStructureId ? Number(form.selectedStructureId) : null,
      policeStationId: isSecurityRole && form.selectedStructureId ? Number(form.selectedStructureId) : null,
      photo: form.photo,
      address: form.address,
      city: form.city,
      dateOfBirth: form.dateOfBirth,
      placeOfBirth: form.placeOfBirth,
      nationality: form.nationality,
      cin: form.cin,
    };
    if (newPassword) payload.password = newPassword;
    updateMutation.mutate(payload);
  }, [form, newPassword, isJusticeRole, isSecurityRole]);

  // ✅ 9. EARLY RETURN
  if (!userId) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Erreur" showBack />
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorMsg, { color: "#EF4444" }]}>ID utilisateur invalide</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: primaryColor }]} onPress={() => navigation.goBack()}>
            <Text style={{ color: "#FFF", fontWeight: '700' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Chargement..." showBack={true} />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ color: colors.textSub, marginTop: 10 }}>Chargement des informations...</Text>
      </View>
    </ScreenContainer>
  );

  if (loadError || !user) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Erreur" showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorMsg, { color: "#EF4444" }]}>Impossible de charger l'utilisateur #{userId}</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: primaryColor }]} onPress={() => queryClient.invalidateQueries({ queryKey: ["user", userId] })}>
          <Text style={{ color: "#FFF", fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );

  // ✅ 10. RENDU PRINCIPAL
  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Fiche Agent" showBack={true} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bgMain }} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.bgMain }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* PHOTO */}
          <View style={styles.photoSection}>
            <TouchableOpacity activeOpacity={0.8} style={[styles.photoFrame, { borderColor: primaryColor, backgroundColor: colors.bgCard }]} onPress={pickImage}>
              {form.photo ? <Image source={{ uri: form.photo }} style={styles.fullImage} /> : <Ionicons name="camera-outline" size={40} color={primaryColor} />}
            </TouchableOpacity>
            <Text style={[styles.photoLabel, { color: colors.textSub }]}>Photo d'identification</Text>
            <TouchableOpacity onPress={pickImage} style={{ marginTop: 8 }}>
              <Text style={{ color: primaryColor, fontWeight: '700', fontSize: 12 }}>📷 Changer la photo</Text>
            </TouchableOpacity>
          </View>

          {/* STATUS */}
          <View style={[styles.statusCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={[styles.statusDot, { backgroundColor: form.isActive ? "#10B981" : "#EF4444" }]} />
              <Text style={[styles.statusTitle, { color: colors.textMain }]}>{form.isActive ? "COMPTE ACTIF" : "ACCÈS RÉVOQUÉ"}</Text>
            </View>
            <Switch value={form.isActive} onValueChange={(v) => setForm(f => ({ ...f, isActive: v }))} thumbColor="#FFF" trackColor={{ false: "#CBD5E1", true: "#10B981" }} />
          </View>

          {/* IDENTITÉ */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Identité</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Prénom</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.firstname} onChangeText={(t) => setForm(f => ({ ...f, firstname: t }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Nom</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.lastname} onChangeText={(t) => setForm(f => ({ ...f, lastname: t.toUpperCase() }))} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Date de naissance</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.dateOfBirth} onChangeText={(t) => setForm(f => ({ ...f, dateOfBirth: t }))} placeholder="JJ/MM/AAAA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Lieu de naissance</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.placeOfBirth} onChangeText={(t) => setForm(f => ({ ...f, placeOfBirth: t }))} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Nationalité</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.nationality} onChangeText={(t) => setForm(f => ({ ...f, nationality: t }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>N° Pièce d'identité</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.cin} onChangeText={(t) => setForm(f => ({ ...f, cin: t.toUpperCase() }))} />
            </View>
          </View>

          {/* CONTACT */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Coordonnées</Text>
          <Text style={[styles.label, { color: colors.textSub }]}>Email Professionnel</Text>
          <TextInput style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.email} onChangeText={(t) => setForm(f => ({ ...f, email: t }))} keyboardType="email-address" autoCapitalize="none" />

          <Text style={[styles.label, { color: colors.textSub }]}>Email Personnel</Text>
          <TextInput style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.personalEmail} onChangeText={(t) => setForm(f => ({ ...f, personalEmail: t }))} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Téléphone</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.telephone} onChangeText={(t) => setForm(f => ({ ...f, telephone: t }))} keyboardType="phone-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Téléphone Alt.</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.alternativePhone} onChangeText={(t) => setForm(f => ({ ...f, alternativePhone: t }))} keyboardType="phone-pad" />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSub }]}>Adresse Complète</Text>
          <TextInput style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.address} onChangeText={(t) => setForm(f => ({ ...f, address: t }))} />

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Ville</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.city} onChangeText={(t) => setForm(f => ({ ...f, city: t }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>Matricule</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]} value={form.registrationNumber} onChangeText={(t) => setForm(f => ({ ...f, registrationNumber: t }))} autoCapitalize="characters" />
            </View>
          </View>

          {/* SÉCURITÉ */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Sécurité</Text>
          <View style={styles.passwordContainer}>
            <TouchableOpacity activeOpacity={0.7} style={[styles.generateBtn, { borderColor: primaryColor }]} onPress={generatePassword}>
              <Ionicons name="key-outline" size={20} color={primaryColor} />
              <Text style={[styles.generateText, { color: primaryColor }]}>Générer un nouveau mot de passe</Text>
            </TouchableOpacity>
            {newPassword !== "" && (
              <View style={[styles.generatedPasswordBox, { backgroundColor: colors.passBox, borderColor: colors.passText + "40" }]}>
                <Text style={[styles.generatedPasswordText, { color: colors.passText }]}>{newPassword}</Text>
                <Text style={[styles.passwordNote, { color: colors.passText }]}>Copié au presse-papier</Text>
              </View>
            )}
          </View>

          {/* RÔLES */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Affectation des Pouvoirs</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => (
              <TouchableOpacity key={r.value} activeOpacity={0.8} style={[styles.roleChip, { backgroundColor: form.role === r.value ? r.color : colors.bgCard, borderColor: form.role === r.value ? r.color : colors.border }]} onPress={() => setForm(f => ({ ...f, role: r.value, selectedStructureId: null }))}>
                <Ionicons name={r.icon as any} size={14} color={form.role === r.value ? "#FFF" : r.color} />
                <Text style={[styles.roleChipText, { color: form.role === r.value ? "#FFF" : colors.textMain }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AFFECTATION */}
          {(isJusticeRole || isSecurityRole) && (
            <View style={{ marginTop: 25 }}>
              <Text style={[styles.sectionTitle, { color: colors.textSub }]}>{isJusticeRole ? 'Juridiction d\'affectation' : 'Unité de Police d\'affectation'}</Text>
              {((isJusticeRole && !courts) || (isSecurityRole && !stations)) ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color={primaryColor} />
                  <Text style={[styles.emptyText, { color: colors.textSub }]}>Chargement...</Text>
                </View>
              ) : (
                <View style={styles.structureList}>
                  {isJusticeRole && courts && courts.length > 0 && (courts as any[]).map((item: any) => (
                    <TouchableOpacity key={item.id} style={[styles.structItem, { backgroundColor: colors.bgCard, borderColor: form.selectedStructureId === item.id ? primaryColor : colors.border }]} onPress={() => setForm(f => ({ ...f, selectedStructureId: item.id }))}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
                        <Text style={{ color: colors.textSub, fontSize: 11, marginTop: 2 }}>{item.city || "Juridiction"}</Text>
                      </View>
                      {form.selectedStructureId === item.id && <Ionicons name="checkmark-circle" size={24} color={primaryColor} />}
                    </TouchableOpacity>
                  ))}
                  {isSecurityRole && stations && stations.length > 0 && (stations as any[]).map((item: any) => (
                    <TouchableOpacity key={item.id} style={[styles.structItem, { backgroundColor: colors.bgCard, borderColor: form.selectedStructureId === item.id ? primaryColor : colors.border }]} onPress={() => setForm(f => ({ ...f, selectedStructureId: item.id }))}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
                        <Text style={{ color: colors.textSub, fontSize: 11, marginTop: 2 }}>{item.city || "Commissariat"}</Text>
                      </View>
                      {form.selectedStructureId === item.id && <Ionicons name="checkmark-circle" size={24} color={primaryColor} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* BOUTON SAVE */}
          <TouchableOpacity activeOpacity={0.85} style={[styles.saveBtn, { backgroundColor: primaryColor, opacity: updateMutation.isPending ? 0.7 : 1 }]} onPress={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <ActivityIndicator color="#FFF" /> : (
              <><Text style={styles.saveText}>METTRE À JOUR LA FICHE</Text><Ionicons name="cloud-upload-outline" size={20} color="#FFF" /></>
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  errorMsg: { fontSize: 14, fontWeight: '700', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  scrollContent: { padding: 20, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  photoSection: { alignItems: 'center', marginBottom: 25 },
  photoFrame: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoLabel: { fontSize: 11, marginTop: 8, fontWeight: '700', color: '#94A3B8' },
  fullImage: { width: '100%', height: '100%' },
  statusCard: { padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, marginBottom: 25 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusTitle: { fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 10 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontWeight: '700', borderWidth: 1.5, flex: 1 },
  inputFull: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontWeight: '700', marginBottom: 15, borderWidth: 1.5 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  roleChipText: { fontSize: 11, fontWeight: '800', marginLeft: 8 },
  structureList: { gap: 10 },
  emptyBox: { padding: 20, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 13, fontWeight: '600' },
  structItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 18, borderWidth: 2, alignItems: 'center' },
  saveBtn: { height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 35, gap: 12, flexDirection: 'row' },
  saveText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  passwordContainer: { marginTop: 10, marginBottom: 15 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16, gap: 10 },
  generateText: { fontWeight: '800', fontSize: 12 },
  generatedPasswordBox: { marginTop: 12, padding: 15, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 4 },
  generatedPasswordText: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  passwordNote: { fontSize: 10, fontWeight: '700' }
});