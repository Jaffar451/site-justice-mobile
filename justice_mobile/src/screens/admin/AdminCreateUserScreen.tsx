import React, { useState, useMemo } from 'react';
import { 
  View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, StatusBar
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';

import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";
import { useAppTheme } from '../../theme/AppThemeProvider';
import { createUser } from '../../services/admin.service';
import { getAllCourts } from '../../services/court.service'; 
import { getAllStations } from '../../services/policeStation.service';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCreateUser'>;

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

export default function AdminCreateUserScreen({ navigation }: Props) {
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

  // ✅ NOUVEAUX CHAMPS AJOUTÉS
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '', // Email professionnel
    personalEmail: '', // ✅ Email personnel (NOUVEAU)
    telephone: '',
    alternativePhone: '', // ✅ Téléphone alternatif (NOUVEAU)
    password: '',
    role: 'officier_police' as UserRole,
    selectedStructureId: null as number | null,
    matricule: '',
    station: '',
    address: '', // ✅ Adresse complète (NOUVEAU)
    city: '', // ✅ Ville (NOUVEAU)
    dateOfBirth: '', // ✅ Date de naissance (NOUVEAU)
    placeOfBirth: '', // ✅ Lieu de naissance (NOUVEAU)
    nationality: 'Nigérienne', // ✅ Nationalité (NOUVEAU)
    cin: '', // ✅ CIN/PIECE IDENTITÉ (NOUVEAU)
  });

  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
    setShowPassword(true);
  };

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la galerie est requis pour ajouter une photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigation.replace("AdminUserDetails", { 
        userId: newUser.id || newUser._id 
      });
      if (Platform.OS === 'web') {
        window.alert("L'agent a été correctement enrôlé !");
      } else {
        Alert.alert("Succès", "L'agent a été correctement enrôlé !");
      }
    },
    onError: (err: any) => {
      Alert.alert("Échec", err.response?.data?.message || "Erreur serveur.");
    }
  });

  const handleCreateUser = async () => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim() || !form.password.trim()) {
      return Alert.alert("Données manquantes", "Prénom, nom, email pro et mot de passe sont obligatoires.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return Alert.alert("Email pro invalide", "Veuillez saisir une adresse email valide.");
    }
    if (form.personalEmail && !emailRegex.test(form.personalEmail.trim())) {
      return Alert.alert("Email personnel invalide", "Veuillez saisir une adresse email valide.");
    }
    if (form.password.length < 6) {
      return Alert.alert("Mot de passe faible", "Le mot de passe doit contenir au moins 6 caractères.");
    }

    if (['commissaire', 'officier_police', 'prosecutor', 'judge', 'greffier'].includes(form.role)) {
      if (!form.selectedStructureId) {
        return Alert.alert("Affectation requise", "Veuillez sélectionner une unité ou juridiction.");
      }
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
      personalEmail: form.personalEmail ? form.personalEmail.trim().toLowerCase() : null,
      matricule: form.matricule || `MAT-${Date.now().toString().slice(-6)}`,
      courtId: organization === "JUSTICE" ? Number(form.selectedStructureId) : null,
      policeStationId: organization === "POLICE" ? Number(form.selectedStructureId) : null,
      organization,
      isActive: true,
      photo: image,
    };

    mutation.mutate(payload);
  };

  const InputField = ({ label, value, onChange, placeholder, icon, keyboardType = "default" }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.textSub }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name={icon} size={20} color={colors.textSub} style={{ marginRight: 12 }} />
        <TextInput
          style={[styles.input, { color: colors.textMain }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

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
            <Text style={[styles.photoHint, { color: colors.textSub }]}>Photo d'identification (optionnel)</Text>
          </View>

          {/* IDENTITÉ */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Identité Officielle</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputField label="Prénom" value={form.firstname} onChange={(t: string) => setForm({...form, firstname: t})} placeholder="Prénom" icon="person-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Nom" value={form.lastname} onChange={(t: string) => setForm({...form, lastname: t})} placeholder="NOM" icon="person-outline" />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputField label="Date de naissance" value={form.dateOfBirth} onChange={(t: string) => setForm({...form, dateOfBirth: t})} placeholder="JJ/MM/AAAA" icon="calendar-outline" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Lieu de naissance" value={form.placeOfBirth} onChange={(t: string) => setForm({...form, placeOfBirth: t})} placeholder="Ville, Pays" icon="location-outline" />
            </View>
          </View>

          <InputField label="Nationalité" value={form.nationality} onChange={(t: string) => setForm({...form, nationality: t})} placeholder="Nationalité" icon="flag-outline" />
          <InputField label="N° Pièce d'identité (CIN)" value={form.cin} onChange={(t: string) => setForm({...form, cin: t.toUpperCase()})} placeholder="Numéro de pièce" icon="card-outline" />

          {/* CONTACT */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Coordonnées</Text>
          <InputField label="Email Professionnel *" value={form.email} onChange={(t: string) => setForm({...form, email: t})} placeholder="agent@justice.ne" icon="mail-outline" keyboardType="email-address" />
          <InputField label="Email Personnel" value={form.personalEmail} onChange={(t: string) => setForm({...form, personalEmail: t})} placeholder="email@personnel.com" icon="mail-unread-outline" keyboardType="email-address" />
          
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputField label="Téléphone *" value={form.telephone} onChange={(t: string) => setForm({...form, telephone: t})} placeholder="90000000" icon="call-outline" keyboardType="phone-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Téléphone Alt." value={form.alternativePhone} onChange={(t: string) => setForm({...form, alternativePhone: t})} placeholder="96000000" icon="call-outline" keyboardType="phone-pad" />
            </View>
          </View>

          <InputField label="Adresse Complète" value={form.address} onChange={(t: string) => setForm({...form, address: t})} placeholder="Quartier, Rue, N°" icon="home-outline" />
          <InputField label="Ville" value={form.city} onChange={(t: string) => setForm({...form, city: t})} placeholder="Ville de résidence" icon="location-outline" />

          {/* SÉCURITÉ */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Sécurité</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSub }]}>MOT DE PASSE *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSub} style={{ marginRight: 12 }} />
              <TextInput
                style={[styles.input, { color: colors.textMain }]}
                value={form.password}
                onChangeText={(t) => setForm({...form, password: t})}
                placeholder="Mot de passe"
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSub} />
              </TouchableOpacity>
              <TouchableOpacity onPress={generateSecurePassword} style={{ padding: 8 }}>
                <Ionicons name="refresh-outline" size={20} color={primaryColor} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 10, color: colors.textSub, marginTop: 5 }}>Cliquez sur la flèche pour générer un mot de passe sécurisé</Text>
          </View>

          {form.role !== 'citizen' && (
            <InputField label="Numéro de Matricule" value={form.matricule} onChange={(t: string) => setForm({...form, matricule: t.toUpperCase()})} placeholder="MAT-000000" icon="barcode-outline" />
          )}

          {/* RÔLES */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Habilitation Système</Text>
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

          {/* BOUTON */}
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
  photoFrame: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  fullImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  placeholderText: { fontSize: 10, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
  photoHint: { fontSize: 11, marginTop: 8, textAlign: 'center' },
  sectionTitle: { fontSize: 10, fontWeight: "900", marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 10 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 15, fontWeight: "700", height: '100%' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, width: '48.5%', gap: 10, borderWidth: 1.5 },
  roleLabel: { fontSize: 11, fontWeight: '800', flex: 1 },
  structureList: { gap: 10 },
  structureItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18 },
  submitBtn: { height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 35, elevation: 4 },
  submitText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 }
});