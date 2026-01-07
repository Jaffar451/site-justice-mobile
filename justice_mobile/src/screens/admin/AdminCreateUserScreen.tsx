import React, { useState, useMemo } from 'react';
import { 
  View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, StatusBar
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ✅ Layout Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Architecture & Thème
import { AdminScreenProps } from '../../types/navigation';
import { useAppTheme } from '../../theme/AppThemeProvider';

// ✅ Services
import { createUser } from '../../services/admin.service';
import { getAllCourts } from '../../services/court.service'; 
import { getAllStations } from '../../services/policeStation.service';

// 🛠️ TYPES
type UserRole = "admin" | "prosecutor" | "judge" | "greffier" | "commissaire" | "officier_police" | "inspecteur" | "citizen";
type OrganizationType = "POLICE" | "GENDARMERIE" | "JUSTICE" | "ADMIN" | "CITIZEN";

const ROLES_CONFIG: { value: UserRole; label: string; icon: string; color: string }[] = [
  { value: "officier_police", label: "Officier (OPJ)", icon: "shield-outline", color: "#2563EB" },
  { value: "commissaire", label: "Commissaire", icon: "ribbon-outline", color: "#1E40AF" },
  { value: "prosecutor", label: "Procureur", icon: "business-outline", color: "#8B5CF6" },
  { value: "judge", label: "Juge", icon: "hammer-outline", color: "#7C3AED" },
  { value: "greffier", label: "Greffier", icon: "book-outline", color: "#0D9488" },
  { value: "admin", label: "Admin Système", icon: "key-outline", color: "#EF4444" },
  { value: "citizen", label: "Citoyen", icon: "person-outline", color: "#64748B" },
];

export default function AdminCreateUserScreen({ navigation }: AdminScreenProps<'AdminCreateUser'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
    password: '', // ✅ Ajout du champ password
    role: 'officier_police' as UserRole,
    selectedStructureId: null as number | null,
    matricule: ''
  });

  // 🎲 Fonction pour générer un mot de passe sécurisé
  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
    setShowPassword(true);
  };

  // --- 1. CHARGEMENT DES STRUCTURES ---
  const { data: courtsRaw } = useQuery({
    queryKey: ['courts'],
    queryFn: getAllCourts,
    enabled: ['prosecutor', 'judge', 'greffier'].includes(form.role)
  });

  const { data: stationsRaw } = useQuery({
    queryKey: ['stations'],
    queryFn: getAllStations,
    enabled: ['officier_police', 'commissaire'].includes(form.role)
  });

  const courts = useMemo(() => (courtsRaw as any)?.data || (Array.isArray(courtsRaw) ? courtsRaw : []), [courtsRaw]);
  const stations = useMemo(() => (stationsRaw as any)?.data || (Array.isArray(stationsRaw) ? stationsRaw : []), [stationsRaw]);

  // --- 2. LOGIQUE DE CRÉATION ---
  const mutation = useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert("Succès", "L'agent a été correctement enrôlé.", [
          { text: "OK", onPress: () => navigation.navigate("AdminUsers") }
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Échec", err.response?.data?.message || "Erreur serveur.");
    }
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) setImage(result.assets[0].uri);
  };

  const handleCreateUser = () => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim() || !form.password.trim()) {
      return Alert.alert("Données manquantes", "Veuillez remplir tous les champs, y compris le mot de passe.");
    }

    let organization: OrganizationType = "CITIZEN";
    if (['officier_police', 'commissaire'].includes(form.role)) organization = "POLICE";
    else if (['prosecutor', 'judge', 'greffier'].includes(form.role)) organization = "JUSTICE";
    else if (form.role === 'admin') organization = "ADMIN";

    const payload = {
      ...form,
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      matricule: form.matricule || `MAT-${Date.now().toString().slice(-6)}`,
      courtId: organization === "JUSTICE" ? Number(form.selectedStructureId) : null,
      policeStationId: organization === "POLICE" ? Number(form.selectedStructureId) : null,
      organization,
      isActive: true,
      photo: image
    };

    mutation.mutate(payload);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Enrôlement Agent" showBack={true} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* PHOTO */}
          <View style={styles.photoUploadContainer}>
            <TouchableOpacity style={[styles.photoFrame, { backgroundColor: colors.bgCard, borderColor: colors.border }]} onPress={pickImage}>
              {image ? <Image source={{ uri: image }} style={styles.fullImage} /> : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-outline" size={32} color={primaryColor} />
                  <Text style={[styles.placeholderText, { color: primaryColor }]}>Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* FORMULAIRE */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Identité Officielle</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.inputHalf, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Prénom" placeholderTextColor={colors.textSub}
              value={form.firstname} onChangeText={(t) => setForm({...form, firstname: t})}
            />
            <TextInput
              style={[styles.inputHalf, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Nom" placeholderTextColor={colors.textSub}
              value={form.lastname} onChangeText={(t) => setForm({...form, lastname: t})}
            />
          </View>

          <TextInput
            style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Email (Identifiant)" placeholderTextColor={colors.textSub}
            value={form.email} onChangeText={(t) => setForm({...form, email: t})}
            autoCapitalize="none" keyboardType="email-address"
          />

          {/* ✅ NOUVEAU : CHAMP MOT DE PASSE AVEC GÉNÉRATEUR */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.inputPassword, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Mot de passe" placeholderTextColor={colors.textSub}
              value={form.password} onChangeText={(t) => setForm({...form, password: t})}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={[styles.actionIcon, { borderColor: colors.border }]} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSub} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionIcon, { borderColor: colors.border, backgroundColor: primaryColor + '10' }]} onPress={generateSecurePassword}>
              <Ionicons name="refresh-outline" size={20} color={primaryColor} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 15, marginLeft: 5 }}>
            Astuce : Cliquez sur la flèche bleue pour générer un mot de passe.
          </Text>

          {form.role !== 'citizen' && (
            <TextInput
              style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Numéro de Matricule" placeholderTextColor={colors.textSub}
              value={form.matricule} onChangeText={(t) => setForm({...form, matricule: t.toUpperCase()})}
            />
          )}

          {/* RÔLES */}
          <Text style={[styles.sectionTitle, { marginTop: 10, color: colors.textSub }]}>Habilitation Système</Text>
          <View style={styles.roleGrid}>
            {ROLES_CONFIG.map((r) => {
              const isSelected = form.role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  activeOpacity={0.8}
                  onPress={() => setForm({...form, role: r.value as UserRole, selectedStructureId: null})}
                  style={[styles.roleCard, { backgroundColor: isSelected ? r.color : colors.bgCard, borderColor: isSelected ? r.color : colors.border }]}
                >
                  <Ionicons name={r.icon as any} size={18} color={isSelected ? "#FFF" : r.color} />
                  <Text style={[styles.roleLabel, { color: isSelected ? "#FFF" : colors.textMain }]} numberOfLines={1}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* AFFECTATION */}
          {['commissaire', 'officier_police', 'prosecutor', 'judge', 'greffier'].includes(form.role) && (
            <View style={{ marginTop: 25 }}>
              <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Unité ou Juridiction d'affectation</Text>
              <View style={styles.structureList}>
                {((form.role === 'officier_police' || form.role === 'commissaire') ? stations : courts).map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setForm({...form, selectedStructureId: item.id})}
                    style={[styles.structureItem, { 
                      backgroundColor: colors.bgCard, 
                      borderColor: form.selectedStructureId === item.id ? primaryColor : colors.border,
                      borderWidth: form.selectedStructureId === item.id ? 2 : 1.5
                    }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMain, fontWeight: "800", fontSize: 14 }}>{item.name}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 11, marginTop: 2 }}>{item.city || item.jurisdiction}</Text>
                    </View>
                    {form.selectedStructureId === item.id && <Ionicons name="checkmark-circle" size={24} color={primaryColor} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.submitBtn, { backgroundColor: primaryColor }, mutation.isPending && { opacity: 0.6 }]} 
            onPress={handleCreateUser}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <ActivityIndicator color="#FFF" /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.submitText}>VALIDER L'ENRÔLEMENT</Text>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" style={{ marginLeft: 10 }} />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  photoUploadContainer: { alignItems: 'center', marginBottom: 25 },
  photoFrame: { width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  fullImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  placeholderText: { fontSize: 10, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 10, fontWeight: "900", marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  inputHalf: { flex: 1, height: 56, borderRadius: 16, paddingHorizontal: 18, borderWidth: 1.5 },
  inputFull: { width: '100%', height: 56, borderRadius: 16, paddingHorizontal: 18, marginBottom: 15, borderWidth: 1.5 },
  
  // PASSWORD STYLES
  passwordContainer: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  inputPassword: { flex: 1, height: 56, borderRadius: 16, paddingHorizontal: 18, borderWidth: 1.5 },
  actionIcon: { width: 56, height: 56, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, width: '48.5%', gap: 10, borderWidth: 1.5 },
  roleLabel: { fontSize: 12, fontWeight: '800', flex: 1 },
  structureList: { gap: 10 },
  structureItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18 },
  submitBtn: { height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 35, elevation: 4 },
  submitText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 }
});