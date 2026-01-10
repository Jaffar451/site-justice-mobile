// PATH: src/screens/police/PoliceComplaintDetailsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Image, Platform, KeyboardAvoidingView, StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// ✅ Architecture & Logic
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import {
  getComplaintById,
  uploadAttachment,
  deleteAttachment,
  updateComplaint,
  submitToCommissaire
} from "../../services/complaint.service";
import { generateComplaintPDF } from "../../services/pdf.service";

export default function PoliceComplaintDetailsScreen({ route, navigation }: PoliceScreenProps<'PoliceComplaintDetails'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  // Extraction sécurisée du paramètre
  const { complaintId } = route.params;

  // États locaux
  const [complaint, setComplaint] = useState<any | null>(null);
  const [pv, setPv] = useState("");
  const [offence, setOffence] = useState("");
  const [signature, setSignature] = useState<string | null>(null); // Stockage de la signature Base64
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    disabled: isDark ? "#1E293B" : "#F1F5F9"
  };

  const isGendarme = user?.role === "gendarme";
  const superiorLabel = isGendarme ? "Cdt de Brigade" : "Commissaire";
  const unitLabel = isGendarme ? "Brigade" : "Commissariat";

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getComplaintById(complaintId);
      setComplaint(data);
      setPv(data.pvDetails || ""); 
      setOffence(data.provisionalOffence || "");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les détails du dossier.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [complaintId]);

  /**
   * 📄 GÉNÉRATION DU PDF (Avec signature si disponible)
   */
  const handlePrint = async () => {
    if (!complaint) return;
    try {
      await generateComplaintPDF(complaint, signature || undefined);
    } catch (error) {
      Alert.alert("Erreur PDF", "Échec de la génération du document.");
    }
  };

  /**
   * ✍️ CAPTURE DE LA SIGNATURE
   */
  const handleCaptureSignature = () => {
    navigation.navigate("SignatureCapture" as any, {
      title: "Signature du déclarant",
      onSave: (base64: string) => {
        setSignature(base64);
        Alert.alert("Signature enregistrée", "La signature a été apposée sur le dossier numérique.");
      }
    });
  };

  /**
   * 📸 AJOUT DE SCELLÉ (Image)
   */
  const handleAddProof = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Permission", "Accès galerie requis.");

    const pick = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!pick.canceled && pick.assets[0]) {
      try {
        setIsSubmitting(true);
        await uploadAttachment(complaintId, {
          uri: pick.assets[0].uri,
          name: `SCELLÉ_RG${complaintId}_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
        await loadData();
      } catch (e) {
        Alert.alert("Erreur", "L'upload a échoué.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * ⚖️ TRANSMISSION À LA HIÉRARCHIE (VISA)
   */
  const handleTransmit = async () => {
    if (!offence.trim() || pv.trim().length < 15) {
      return Alert.alert("Incomplet", "La qualification juridique et le rapport d'enquête sont obligatoires.");
    }
    
    Alert.alert(
      "Transmission pour Visa ⚖️",
      `Voulez-vous transmettre ce PV au ${superiorLabel} pour validation finale ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Transmettre", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              // Mise à jour des informations OPJ
              await updateComplaint(Number(complaintId), { 
                provisionalOffence: offence, 
                pvDetails: pv,
                status: "attente_validation" 
              } as any);
              
              await submitToCommissaire(complaintId);
              
              Alert.alert("Succès", `Dossier transmis avec succès au ${superiorLabel}.`);
              navigation.navigate("PoliceHome");
            } catch (e) {
              Alert.alert("Erreur", "La transmission a échoué. Vérifiez votre connexion.");
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
  const isEditable = complaint?.status === "en_cours_OPJ" || complaint?.status === "soumise";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RG-${complaintId}`;

  if (loading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Chargement..." showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}><ActivityIndicator size="large" color={primaryColor} /></View>
    </ScreenContainer>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Dossier RG-${complaintId}`} showBack />
      
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollPadding} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* CARTE ENTÊTE : DÉCLARATION INITIALE */}
            <View style={[styles.headerCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={styles.badgeRow}>
                <View style={[styles.unitBadge, { backgroundColor: primaryColor + "15" }]}>
                    <Text style={[styles.unitText, { color: primaryColor }]}>{unitLabel.toUpperCase()}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={handlePrint} style={[styles.printBtn, { backgroundColor: primaryColor }]}>
                    <Ionicons name="print" size={16} color="#fff" />
                    <Text style={styles.printText}>GÉNÉRER PV</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.sectionLabel, { color: primaryColor, marginTop: 15 }]}>FAITS DÉCLARÉS :</Text>
              <Text style={[styles.descriptionText, { color: colors.textMain }]}>{complaint?.description}</Text>
            </View>

            {/* TIMELINE DE PROCÉDURE */}
            <View style={styles.timelineWrapper}>
                {steps.map((s, i) => (
                    <View key={s.key} style={styles.stepItem}>
                        <View style={[styles.dot, { backgroundColor: i <= activeIndex ? primaryColor : colors.border }]} />
                        <Text style={[styles.stepLabel, { color: i === activeIndex ? primaryColor : colors.textSub }]}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* SCELLÉ NUMÉRIQUE (QR CODE) */}
            <View style={[styles.qrCard, { backgroundColor: isDark ? "#0c4a6e" : "#F0F9FF", borderColor: primaryColor + "30" }]}>
                <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[styles.qrTitle, { color: isDark ? "#bae6fd" : "#0c4a6e" }]}>Scellé Numérique</Text>
                    <Text style={[styles.qrSub, { color: isDark ? "#7dd3fc" : "#0369a1" }]}>Vérification CID : {complaint?.trackingCode || 'Authentification en cours...'}</Text>
                </View>
            </View>

            {/* TRAVAIL DE L'OPJ */}
            <View style={styles.formContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSub }]}>Qualification Juridique Provisoire *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }, !isEditable && { backgroundColor: colors.disabled }]}
                    value={offence}
                    onChangeText={setOffence}
                    placeholder="Ex: Vol de bétail, Escroquerie..."
                    placeholderTextColor={colors.textSub}
                    editable={isEditable}
                />

                <Text style={[styles.inputLabel, { color: colors.textSub }]}>Rapport de Synthèse OPJ *</Text>
                <TextInput
                    style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }, !isEditable && { backgroundColor: colors.disabled }]}
                    multiline
                    numberOfLines={8}
                    value={pv}
                    onChangeText={setPv}
                    placeholder="Détaillez ici vos constatations et les actes d'enquête effectués..."
                    placeholderTextColor={colors.textSub}
                    editable={isEditable}
                    textAlignVertical="top"
                />

                {/* SIGNATURE TACTILE */}
                {isEditable && (
                  <TouchableOpacity 
                    style={[styles.sigBtn, { borderColor: signature ? "#10B981" : colors.border }]} 
                    onPress={handleCaptureSignature}
                  >
                    <Ionicons name={signature ? "checkmark-circle" : "create-outline"} size={20} color={signature ? "#10B981" : primaryColor} />
                    <Text style={[styles.sigBtnText, { color: signature ? "#10B981" : colors.textMain }]}>
                      {signature ? "Signature du déclarant recueillie" : "Recueillir la signature du plaignant"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* GESTION DES SCELLÉS (PIÈCES JOINTES) */}
                <View style={styles.evidenceHeader}>
                    <Text style={[styles.inputLabel, { color: colors.textSub }]}>Pièces à conviction (Scellés)</Text>
                    {isEditable && (
                        <TouchableOpacity activeOpacity={0.7} onPress={handleAddProof} style={[styles.actionBtn, { backgroundColor: primaryColor }]}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.evidenceGrid}>
                    {complaint?.attachments?.map((file: any) => (
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

                {/* ACTIONS FINALES */}
                {isEditable ? (
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        style={[styles.mainBtn, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }]} 
                        onPress={handleTransmit}
                        disabled={isSubmitting}
                    >
                      {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                          <>
                              <Text style={styles.mainBtnText}>TRANSMETTRE POUR VISA</Text>
                              <Ionicons name="shield-checkmark" size={18} color="#fff" />
                          </>
                      )}
                    </TouchableOpacity>
                ) : (
                  <View style={[styles.lockedContainer, { backgroundColor: isDark ? "#1e1b4b" : "#EEF2FF", borderColor: "#C7D2FE" }]}>
                    <Ionicons name="lock-closed" size={18} color={primaryColor} />
                    <Text style={[styles.lockedText, { color: primaryColor }]}>Ce dossier est en cours de validation par la hiérarchie.</Text>
                  </View>
                )}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollPadding: { padding: 20, paddingBottom: 120 },
  headerCard: { padding: 18, borderRadius: 20, borderWidth: 1, elevation: 2, marginBottom: 25 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unitBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  unitText: { fontWeight: '900', fontSize: 10 },
  printBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  printText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  descriptionText: { fontSize: 14, marginTop: 8, lineHeight: 20, fontWeight: "500" },
  timelineWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingHorizontal: 5 },
  stepItem: { alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 5 },
  stepLabel: { fontSize: 9, fontWeight: '800' },
  qrCard: { flexDirection: "row", padding: 15, borderRadius: 18, marginBottom: 25, alignItems: "center", borderStyle: "dashed", borderWidth: 1 },
  qrImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#fff' },
  qrTitle: { fontSize: 14, fontWeight: "900" },
  qrSub: { fontSize: 10, marginTop: 2 },
  formContainer: { paddingBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: "900", marginTop: 15, marginBottom: 8, textTransform: 'uppercase' },
  input: { padding: 14, borderRadius: 12, fontSize: 15, borderWidth: 1.5, fontWeight: "700" },
  textArea: { padding: 14, borderRadius: 12, height: 160, fontSize: 15, borderWidth: 1.5, fontWeight: "500" },
  sigBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 15, borderRadius: 12, borderWidth: 1, marginTop: 15, borderStyle: 'dashed' },
  sigBtnText: { fontSize: 13, fontWeight: '700' },
  evidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  actionBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  evidenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  evidenceCard: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  attachmentImg: { width: '100%', height: '100%' },
  deleteBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FFF', borderRadius: 10, padding: 3 },
  mainBtn: { marginTop: 35, height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3 },
  mainBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  lockedContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 14, marginTop: 25, gap: 10, borderWidth: 1 },
  lockedText: { fontSize: 11, fontWeight: '700', flex: 1 }
});