import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ✅ Architecture & Thème
import { AdminScreenProps } from '../../types/navigation';
import { useAppTheme } from '../../theme/AppThemeProvider'; // Hook dynamique

// Services
import { createUser, getAllCourts } from '../../services/admin.service';
import { getAllStations } from '../../services/policeStation.service';

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

type UserRole = "citizen" | "police" | "prosecutor" | "judge" | "clerk" | "commissaire" | "admin";
type OrganizationType = "POLICE" | "GENDARMERIE" | "JUSTICE" | "ADMIN" | "CITIZEN";

const ROLES_CONFIG: { value: UserRole; label: string; icon: string; color: string }[] = [
  { value: "citizen", label: "Citoyen", icon: "person-outline", color: "#64748B" },
  { value: "police", label: "Officier (OPJ)", icon: "shield-outline", color: "#2563EB" },
  { value: "commissaire", label: "Commissaire", icon: "ribbon-outline", color: "#1E40AF" },
  { value: "prosecutor", label: "Procureur", icon: "business-outline", color: "#8B5CF6" },
  { value: "judge", label: "Juge", icon: "hammer-outline", color: "#7C3AED" },
  { value: "clerk", label: "Greffier", icon: "book-outline", color: "#0D9488" },
  { value: "admin", label: "Admin Système", icon: "key-outline", color: "#EF4444" },
];

export default function AdminCreateUserScreen({ navigation }: AdminScreenProps<'AdminCreateUser'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  
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
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
    role: 'citizen' as UserRole,
    selectedStructureId: null as number | null,
    matricule: ''
  });

  // --- DATA FETCHING ---
  const { data: courts } = useQuery({
    queryKey: ['courts'],
    queryFn: getAllCourts,
    enabled: ['prosecutor', 'judge', 'clerk'].includes(form.role)
  });

  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: getAllStations,
    enabled: ['police', 'commissaire'].includes(form.role)
  });

  // --- LOGIQUE PHOTO ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
    }
  };

  const getOrganizationFromRole = (selectedRole: UserRole): OrganizationType => {
    if (['police', 'commissaire'].includes(selectedRole)) return "POLICE";
    if (['prosecutor', 'judge', 'clerk'].includes(selectedRole)) return "JUSTICE";
    if (selectedRole === 'admin') return "ADMIN";
    return "CITIZEN";
  };

  const mutation = useMutation({
    mutationFn: (data: any) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (Platform.OS === 'web') window.alert("Utilisateur créé avec succès.");
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Échec de l'enrôlement", err.response?.data?.message || "Erreur de connexion serveur.");
    }
  });

  const handleCreateUser = () => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
      Alert.alert("Formulaire incomplet", "Le nom, prénom et email sont obligatoires.");
      return;
    }

    const organization = getOrganizationFromRole(form.role);
    const userData = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone || null,
      role: form.role,
      organization,
      matricule: form.matricule || `MAT-${Math.floor(Math.random() * 10000)}`,
      courtId: organization === "JUSTICE" ? form.selectedStructureId : null,
      policeStationId: organization === "POLICE" ? form.selectedStructureId : null,
      status: "active",
      password: "Pass" + Math.floor(1000 + Math.random() * 9000),
      photo: image
    };

    mutation.mutate(userData);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Enrôlement Agent" showBack={true} />
      
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
          <View style={styles.photoUploadContainer}>
            <TouchableOpacity 
              style={[styles.photoFrame, { backgroundColor: colors.bgCard, borderColor: primaryColor }]} 
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.fullImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-outline" size={36} color={primaryColor} />
                  <Text style={[styles.placeholderText, { color: primaryColor }]}>Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* IDENTITY SECTION */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Identité & Contact</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.inputHalf, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Prénom"
              placeholderTextColor={colors.textSub}
              value={form.firstname}
              onChangeText={(t) => setForm({...form, firstname: t})}
            />
            <TextInput
              style={[styles.inputHalf, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Nom"
              placeholderTextColor={colors.textSub}
              value={form.lastname}
              onChangeText={(t) => setForm({...form, lastname: t.toUpperCase()})}
            />
          </View>

          <TextInput
            style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Email Professionnel"
            placeholderTextColor={colors.textSub}
            value={form.email}
            onChangeText={(t) => setForm({...form, email: t})}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Téléphone"
            placeholderTextColor={colors.textSub}
            value={form.telephone}
            onChangeText={(t) => setForm({...form, telephone: t})}
            keyboardType="phone-pad"
          />

          {form.role !== 'citizen' && (
            <TextInput
              style={[styles.inputFull, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              placeholder="Numéro de Matricule"
              placeholderTextColor={colors.textSub}
              value={form.matricule}
              onChangeText={(t) => setForm({...form, matricule: t.toUpperCase()})}
            />
          )}

          {/* ROLE SECTION */}
          <Text style={[styles.sectionTitle, { marginTop: 25, color: colors.textSub }]}>Habilitations Système</Text>
          <View style={styles.roleGrid}>
            {ROLES_CONFIG.map((r) => {
              const isSelected = form.role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  activeOpacity={0.8}
                  onPress={() => setForm({...form, role: r.value, selectedStructureId: null})}
                  style={[
                    styles.roleCard, 
                    { 
                        backgroundColor: isSelected ? r.color : colors.bgCard,
                        borderColor: isSelected ? r.color : colors.border
                    }
                  ]}
                >
                  <Ionicons name={r.icon as any} size={20} color={isSelected ? "#FFF" : r.color} />
                  <Text style={[styles.roleLabel, { color: isSelected ? "#FFF" : colors.textMain }]} numberOfLines={1}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* STRUCTURE SELECTION */}
          {['police', 'commissaire', 'prosecutor', 'judge', 'clerk'].includes(form.role) && (
            <View style={styles.structureSection}>
              <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Affectation Administrative</Text>
              
              <View style={styles.structureList}>
                {((form.role === 'police' || form.role === 'commissaire') ? stations : courts)?.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setForm({...form, selectedStructureId: item.id})}
                    style={[
                        styles.structureItem, 
                        { 
                            backgroundColor: colors.bgCard, 
                            borderColor: form.selectedStructureId === item.id ? primaryColor : colors.border 
                        }
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textMain, fontWeight: "700", fontSize: 14 }}>
                        {item.name}
                        </Text>
                        <Text style={{ color: colors.textSub, fontSize: 11, marginTop: 2 }}>
                        {item.city || item.jurisdiction}
                        </Text>
                    </View>
                    {form.selectedStructureId === item.id && <Ionicons name="checkmark-circle" size={24} color={primaryColor} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.submitBtn, { backgroundColor: primaryColor }, mutation.isPending && { opacity: 0.7 }]} 
            onPress={handleCreateUser}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>VALIDER L'ENRÔLEMENT</Text>}
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
  photoUploadContainer: { alignItems: 'center', marginBottom: 30 },
  photoFrame: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },
  fullImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  placeholderText: { fontSize: 10, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  
  sectionTitle: { fontSize: 10, fontWeight: "900", marginBottom: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  inputHalf: { flex: 1, height: 56, borderRadius: 16, paddingHorizontal: 18, fontWeight: '600', borderWidth: 1.5 },
  inputFull: { width: '100%', height: 56, borderRadius: 16, paddingHorizontal: 18, fontWeight: '600', marginBottom: 15, borderWidth: 1.5 },
  
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, width: '48.5%', gap: 10, borderWidth: 1.5 },
  roleLabel: { fontSize: 12, fontWeight: '700', flex: 1 },
  
  structureSection: { marginTop: 30 },
  structureList: { gap: 10 },
  structureItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 18, borderWidth: 2 },
  
  submitBtn: { 
    height: 64, borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center', 
    marginTop: 40,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 },
        android: { elevation: 6 }
    })
  },
  submitText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 },
  footerSpacing: { height: 140 }
});