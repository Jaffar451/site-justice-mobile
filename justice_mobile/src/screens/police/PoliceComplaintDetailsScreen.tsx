import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// ✅ Logic & Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import {
  getComplaintById,
  uploadAttachment,
  deleteAttachment,
  updateComplaint,
  submitToCommissaire,
  Complaint
} from "../../services/complaint.service";
import { generateComplaintPDF } from "../../services/pdf.service";

interface ExtendedComplaint extends Complaint {
  pvDetails?: string | null;
  trackingCode?: string;
  attachments?: any[];
}

export default function PoliceComplaintDetailsScreen({ route, navigation }: PoliceScreenProps<'PoliceComplaintDetails'>) {
  // ✅ Thème & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const { complaintId } = route.params;

  const [complaint, setComplaint] = useState<ExtendedComplaint | null>(null);
  const [pv, setPv] = useState("");
  const [offence, setOffence] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    disabled: isDark ? "#1E293B" : "#F1F5F9"
  };

  const isGendarme = user?.organization === "GENDARMERIE";
  const superiorLabel = isGendarme ? "Commandant de Brigade" : "Commissaire";
  const unitLabel = isGendarme ? "Brigade" : "Commissariat";

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getComplaintById(complaintId);
      setComplaint(data as ExtendedComplaint);
      setPv((data as any).pvDetails || ""); 
      setOffence((data as any).provisionalOffence || "");
    } catch (error) {
      if (Platform.OS === 'web') window.alert("Dossier inaccessible");
      else Alert.alert("Dossier Inaccessible", "Ce dossier n'est plus disponible.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [complaintId]);

  const handlePrint = async () => {
    if (complaint) await generateComplaintPDF(complaint as any);
  };

  const handleAddProof = async () => {
    const pick = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!pick.canceled && pick.assets[0]) {
      try {
        setIsSubmitting(true);
        await uploadAttachment(complaintId, {
          uri: pick.assets[0].uri,
          name: `SCELLÉ_${complaintId}_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
        await loadData();
      } catch (e) {
        Alert.alert("Erreur", "L'annexe n'a pu être sauvegardée.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTransmit = async () => {
    if (!offence.trim() || pv.trim().length < 20) {
      return Alert.alert("Données manquantes", "La qualification et le PV sont requis.");
    }
    
    Alert.alert(
      "Visa Hiérarchique ⚖️",
      `Souhaitez-vous clore l'enquête et transmettre le dossier au ${superiorLabel} ?`,
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Transmettre", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await updateComplaint(complaintId, { provisionalOffence: offence, pvDetails: pv } as any);
              await submitToCommissaire(complaintId);
              navigation.navigate("PoliceHome");
            } catch (e) {
              Alert.alert("Erreur", "Échec de la transmission système.");
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const steps = [
    { key: "soumise", label: "Dépôt" },
    { key: "en_cours_OPJ", label: "Enquête" },
    { key: "attente_validation", label: "Visa" },
    { key: "transmise_parquet", label: "Parquet" },
  ];
  
  const activeIndex = complaint ? steps.findIndex((s) => s.key === complaint.status) : 0;
  const isEditable = complaint ? ["soumise", "en_cours_OPJ"].includes(complaint.status) : false;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(complaint?.trackingCode || `RG-${complaint?.id}`)}`;

  if (loading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Chargement..." showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}><ActivityIndicator size="large" color={primaryColor} /></View>
    </ScreenContainer>
  );

  if (!complaint) return null;

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Dossier RG-${complaint.id}`} showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <ScrollView 
          contentContainerStyle={styles.scrollPadding} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* 🏛️ RÉSUMÉ DU DOSSIER */}
          <View style={[styles.headerCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.badgeRow}>
              <View style={[styles.unitBadge, { backgroundColor: primaryColor + "15" }]}>
                  <Text style={[styles.unitText, { color: primaryColor }]}>{unitLabel.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={handlePrint} style={[styles.printBtn, { backgroundColor: primaryColor }]}>
                  <Ionicons name="document-text-outline" size={16} color="#fff" />
                  <Text style={styles.printText}>IMPRIMER PV</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionLabel, { color: primaryColor, marginTop: 15 }]}>DÉCLARATION INITIALE :</Text>
            <Text style={[styles.descriptionText, { color: colors.textMain }]}>{complaint.description}</Text>
          </View>

          {/* 📍 ÉTAT D'AVANCEMENT */}
          <View style={styles.timelineWrapper}>
              {steps.map((s, i) => (
                  <View key={s.key} style={styles.stepItem}>
                      <View style={[styles.dot, { backgroundColor: i <= activeIndex ? primaryColor : colors.border }]} />
                      <Text style={[styles.stepLabel, { color: i === activeIndex ? primaryColor : colors.textSub }]}>{s.label}</Text>
                  </View>
              ))}
          </View>

          {/* 🔐 CERTIFICATION E-JUSTICE */}
          <View style={[styles.qrCard, { backgroundColor: isDark ? "#0c4a6e" : "#F0F9FF", borderColor: primaryColor + "40" }]}>
              <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.qrTitle, { color: isDark ? "#bae6fd" : "#0c4a6e" }]}>Authentifié e-Justice</Text>
                  <Text style={[styles.qrSub, { color: isDark ? "#7dd3fc" : "#0369a1" }]}>Scellé numériquement sur le serveur central de la République.</Text>
              </View>
          </View>

          {/* 🖊️ RÉDACTION OPJ */}
          <View style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSub }]}>Qualification Pénale (Provisoire) *</Text>
              <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }, !isEditable && { backgroundColor: colors.disabled }]}
                  value={offence}
                  onChangeText={setOffence}
                  placeholder="Ex: Vol aggravé, Escroquerie..."
                  placeholderTextColor={colors.textSub}
                  editable={isEditable}
              />

              <Text style={[styles.inputLabel, { color: colors.textSub }]}>Rapport de Synthèse (Corps du PV) *</Text>
              <TextInput
                  style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }, !isEditable && { backgroundColor: colors.disabled }]}
                  multiline
                  numberOfLines={10}
                  value={pv}
                  onChangeText={setPv}
                  placeholder="Consigner ici les constatations et auditions..."
                  placeholderTextColor={colors.textSub}
                  editable={isEditable}
                  textAlignVertical="top"
              />

              {/* 📸 SCELLÉS NUMÉRIQUES */}
              <View style={styles.evidenceHeader}>
                  <Text style={[styles.inputLabel, { color: colors.textSub }]}>Pièces à conviction (Scellés)</Text>
                  {isEditable && (
                      <TouchableOpacity onPress={handleAddProof} style={[styles.actionBtn, { backgroundColor: primaryColor }]}>
                          <Ionicons name="camera" size={20} color="#fff" />
                      </TouchableOpacity>
                  )}
              </View>

              <View style={styles.evidenceGrid}>
                  {complaint.attachments?.map((file: any) => (
                      <View key={file.id} style={[styles.evidenceCard, { borderColor: colors.border }]}>
                          <Image source={{ uri: file.file_url || file.url }} style={styles.attachmentImg} />
                          {isEditable && (
                              <TouchableOpacity 
                                style={styles.deleteBadge} 
                                onPress={() => deleteAttachment(file.id).then(loadData)}
                              >
                                  <Ionicons name="close" size={14} color="#EF4444" />
                              </TouchableOpacity>
                          )}
                      </View>
                  ))}
              </View>

              {/* 📤 ACTIONS FINALES */}
              {isEditable ? (
                  <TouchableOpacity 
                      activeOpacity={0.85}
                      style={[styles.mainBtn, { backgroundColor: primaryColor }]} 
                      onPress={handleTransmit}
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Text style={styles.mainBtnText}>TRANSMETTRE POUR VISA</Text>
                            <Ionicons name="send" size={18} color="#fff" />
                        </>
                    )}
                  </TouchableOpacity>
              ) : (
                <View style={[styles.lockedContainer, { backgroundColor: isDark ? "#422006" : "#FFFBEB", borderColor: isDark ? "#92400e" : "#FEF3C7" }]}>
                  <Ionicons name="lock-closed" size={20} color="#D97706" />
                  <Text style={[styles.lockedText, { color: isDark ? "#fbbf24" : "#B45309" }]}>Dossier en lecture seule. En attente de validation hiérarchique.</Text>
                </View>
              )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollPadding: { padding: 20, paddingBottom: 140 },
  headerCard: { padding: 20, borderRadius: 24, borderWidth: 1, elevation: 2, marginBottom: 25 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unitBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  unitText: { fontWeight: '900', fontSize: 10 },
  printBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  printText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  descriptionText: { fontSize: 15, marginTop: 10, lineHeight: 22, fontWeight: "500" },
  
  timelineWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 10 },
  stepItem: { alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  stepLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  
  qrCard: { flexDirection: "row", padding: 18, borderRadius: 20, marginBottom: 30, alignItems: "center", borderStyle: "dashed", borderWidth: 1.5 },
  qrImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#fff' },
  qrTitle: { fontSize: 15, fontWeight: "900" },
  qrSub: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  
  formContainer: { paddingBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: "900", marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: 16, borderRadius: 14, fontSize: 15, borderWidth: 1.5, fontWeight: "700" },
  textArea: { padding: 16, borderRadius: 14, height: 180, fontSize: 15, borderWidth: 1.5, fontWeight: "500" },
  
  evidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  actionBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  evidenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 },
  evidenceCard: { width: 95, height: 95, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  attachmentImg: { width: '100%', height: '100%' },
  deleteBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#FFF', borderRadius: 10, padding: 4 },
  
  mainBtn: { marginTop: 40, height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 4 },
  mainBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  lockedContainer: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginTop: 30, gap: 12, borderWidth: 1 },
  lockedText: { fontSize: 12, fontWeight: '700', flex: 1 }
});