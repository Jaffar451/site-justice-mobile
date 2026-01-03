import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';

// ✅ Architecture & Thème
import { AdminScreenProps } from "../../types/navigation";
import { useAppTheme } from "../../theme/AppThemeProvider"; // Hook dynamique
import { createCourt } from "../../services/court.service"; 

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const COURT_TYPES = [
  { label: "Tribunal de Grande Instance (TGI)", value: "TGI" },
  { label: "Tribunal d'Instance (TI)", value: "TI" },
  { label: "Cour d'Appel (CA)", value: "CA" },
  { label: "Cour de Cassation", value: "CS" },
  { label: "Tribunal de Commerce", value: "TC" },
  { label: "Tribunal du Travail", value: "TT" },
  { label: "Juridiction Spécialisée", value: "SPECIAL" },
];

export default function AdminCreateCourtScreen({ navigation }: AdminScreenProps<'AdminCreateCourt'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    geoBox: isDark ? "#0F172A" : "#F8FAFC",
  };

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    type: "TGI",
    jurisdiction: "", 
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "L'accès à la localisation est requis pour enregistrer une juridiction.");
        setIsLoadingLocation(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setForm({
        ...form,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      Alert.alert("Erreur GPS", "Impossible de récupérer la position actuelle.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const mutation = useMutation({
    mutationFn: createCourt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      if (Platform.OS === 'web') window.alert("Juridiction créée avec succès.");
      navigation.navigate("AdminCourts"); 
    },
    onError: () => Alert.alert("Erreur", "Impossible de créer la juridiction.")
  });

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.jurisdiction) {
      Alert.alert("Champs manquants", "Le nom, la ville et le ressort sont obligatoires.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert("Géolocalisation requise", "Veuillez capturer les coordonnées GPS avant de valider.");
      return;
    }
    mutation.mutate({ ...form, status: 'active' });
  };

  const InputField = ({ label, value, onChange, placeholder, icon }: any) => (
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
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Nouvelle Juridiction" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1, backgroundColor: colors.bgMain }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.introCard, { backgroundColor: primaryColor + "15" }]}>
            <Ionicons name="map-outline" size={24} color={primaryColor} />
            <Text style={[styles.introText, { color: isDark ? "#BAE6FD" : primaryColor }]}>
              Enregistrement et géolocalisation d'une nouvelle entité judiciaire au Répertoire National.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Information & Localisation</Text>
          
          <View style={styles.formCard}>
            {/* Type d'Instance */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub }]}>TYPE D'INSTANCE</Text>
              <View style={[styles.pickerBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Picker
                  selectedValue={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                  style={{ color: colors.textMain, height: Platform.OS === 'ios' ? 150 : 55 }}
                  dropdownIconColor={colors.textSub}
                >
                  {COURT_TYPES.map((t) => (
                    <Picker.Item key={t.value} label={t.label} value={t.value} color={isDark ? "#FFF" : "#1E293B"} />
                  ))}
                </Picker>
              </View>
            </View>

            <InputField 
              label="NOM OFFICIEL" 
              value={form.name} 
              onChange={(t: string) => setForm({...form, name: t})} 
              placeholder="Ex: TGI de Niamey"
              icon="business-outline"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField 
                  label="VILLE" 
                  value={form.city} 
                  onChange={(t: string) => setForm({...form, city: t})} 
                  placeholder="Ville"
                  icon="location-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                 <InputField 
                  label="RESSORT" 
                  value={form.jurisdiction} 
                  onChange={(t: string) => setForm({...form, jurisdiction: t})} 
                  placeholder="Ressort"
                  icon="map-outline"
                />
              </View>
            </View>

            {/* ✅ SECTION GPS DYNAMIQUE */}
            <View style={[styles.geoContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }, !form.latitude && { borderColor: '#EF4444' }]}>
              <Text style={[styles.label, { color: !form.latitude ? '#EF4444' : colors.textSub }]}>
                COORDONNÉES GPS (OBLIGATOIRE)
              </Text>
              
              <View style={[styles.geoBox, { backgroundColor: colors.geoBox, borderColor: colors.border }]}>
                <View style={styles.geoInfo}>
                  <View style={styles.geoRow}>
                    <Text style={[styles.geoLabel, { color: colors.textSub }]}>Latitude:</Text>
                    <Text style={[styles.geoValue, { color: colors.textMain }]}>
                      {form.latitude ? form.latitude.toFixed(6) : "--.------"}
                    </Text>
                  </View>
                  <View style={styles.geoRow}>
                    <Text style={[styles.geoLabel, { color: colors.textSub }]}>Longitude:</Text>
                    <Text style={[styles.geoValue, { color: colors.textMain }]}>
                      {form.longitude ? form.longitude.toFixed(6) : "--.------"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.geoBtn, { backgroundColor: primaryColor + "20" }]}
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                    <Ionicons name="locate" size={26} color={primaryColor} />
                  )}
                </TouchableOpacity>
              </View>
              
              {!form.latitude && (
                <Text style={styles.errorText}>📍 Appuyez sur la cible pour capturer la position.</Text>
              )}
            </View>
          </View>

          {/* Validation */}
          <TouchableOpacity 
            style={[
              styles.submitBtn, 
              { backgroundColor: primaryColor }, 
              (mutation.isPending || !form.latitude) && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={mutation.isPending || !form.latitude}
          >
             {mutation.isPending ? <ActivityIndicator color="#FFF" /> : (
               <>
                 <Text style={styles.submitText}>ENREGISTRER LA JURIDICTION</Text>
                 <Ionicons name="checkmark-done-circle-outline" size={24} color="#FFF" />
               </>
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
  introCard: { flexDirection: 'row', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 25, gap: 15 },
  introText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 20, letterSpacing: 1.5, textTransform: 'uppercase' },
  formCard: { gap: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, height: 58 },
  input: { flex: 1, fontSize: 16, fontWeight: "700", height: '100%' },
  pickerBox: { borderWidth: 1.5, borderRadius: 16, overflow: 'hidden', justifyContent: 'center', minHeight: 58 },
  row: { flexDirection: 'row' },

  geoContainer: { marginBottom: 25, padding: 20, borderRadius: 24, borderWidth: 1.5, elevation: 2 },
  geoBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 10, borderWidth: 1 },
  geoInfo: { flex: 1, paddingHorizontal: 12, gap: 6 },
  geoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  geoLabel: { fontSize: 12, fontWeight: '700' },
  geoValue: { fontSize: 14, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  geoBtn: { width: 54, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 12, fontWeight: '700', textAlign: 'center' },

  submitBtn: { 
    flexDirection: 'row', 
    height: 64, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 15, 
    gap: 12, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  submitText: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  footerSpacing: { height: 140 }
});