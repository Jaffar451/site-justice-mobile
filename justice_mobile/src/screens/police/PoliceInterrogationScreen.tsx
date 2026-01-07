import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// Composants de mise en page
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceInterrogationScreen({ route, navigation }: PoliceScreenProps<'PoliceInterrogation'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary; 
  const { user } = useAuthStore();
  
  // 🛡️ Récupération sécurisée
  const params = route.params as any;
  const complaintId = params?.complaintId || params?.caseId || 0;
  const suspectName = params?.suspectName || "Le Prévenu";

  const [statement, setStatement] = useState(""); 
  const [lawyerPresent, setLawyerPresent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    headerCard: isDark ? "#1E293B" : "#F8FAFC",
  };

  const handleSaveStatement = async () => {
    // 🛡️ Validation ID et Contenu
    if (!complaintId || complaintId === 'undefined') {
       return Alert.alert("Erreur Dossier", "L'identifiant du dossier est manquant.");
    }

    if (statement.trim().length < 50) {
      const msg = "Le récit de l'audition doit être détaillé (Min. 50 caractères).";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Saisie insuffisante", msg);
      return;
    }

    Alert.alert(
      "Clôture de l'Audition ⚖️",
      "Confirmez-vous le scellage de ce PV ? Cette action est irréversible.",
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Signer & Sceller", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              // ✅ Envoi sécurisé avec Number()
              await updateComplaint(Number(complaintId), {
                interrogationContent: statement.trim(),
                lawyerPresence: lawyerPresent,
                interrogationDate: new Date().toISOString(),
                status: "en_cours_OPJ",
                signingOfficer: `${user?.firstname} ${user?.lastname}`
              } as any);

              Alert.alert("Acte Certifié ✅", "Le procès-verbal a été signé et scellé.");
              navigation.goBack();
            } catch (error) {
              console.error("Interrogation Error:", error);
              Alert.alert("Erreur", "L'enregistrement sécurisé a échoué.");
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Audition Judiciaire" showBack={true} />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollPadding}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" // ✅ Débloque les boutons
          >
            
            {/* BANDEAU PRÉVENU */}
            <View style={[styles.headerCard, { borderLeftColor: primaryColor, backgroundColor: colors.headerCard }]}>
              <Text style={[styles.miniLabel, { color: primaryColor }]}>P.V D'AUDITION NUMÉRIQUE</Text>
              <Text style={[styles.suspectName, { color: colors.textMain }]}>{suspectName.toUpperCase()}</Text>
              <Text style={[styles.caseRef, { color: colors.textSub }]}>Réf. Dossier : RG #{complaintId}</Text>
            </View>

            {/* DROITS DÉFENSE */}
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[
                styles.lawyerToggle, 
                { 
                  borderColor: lawyerPresent ? primaryColor : colors.border,
                  backgroundColor: lawyerPresent ? primaryColor + "10" : colors.bgCard
                }
              ]}
              onPress={() => setLawyerPresent(!lawyerPresent)}
            >
              <Ionicons 
                name={lawyerPresent ? "shield-checkmark" : "shield-outline"} 
                size={24} 
                color={lawyerPresent ? primaryColor : colors.textSub} 
              />
              <View style={{ flex: 1 }}>
                  <Text style={[styles.lawyerText, { color: colors.textMain }]}>Assistance d'un Conseil</Text>
                  <Text style={[styles.lawyerSub, { color: colors.textSub }]}>Présence de l'avocat durant l'acte</Text>
              </View>
              <View style={[styles.radio, { borderColor: lawyerPresent ? primaryColor : colors.border }]}>
                  {lawyerPresent && <View style={[styles.radioDot, { backgroundColor: primaryColor }]} />}
              </View>
            </TouchableOpacity>

            {/* TRANSCRIPTION */}
            <View style={styles.inputHeader}>
                <Text style={[styles.inputLabel, { color: colors.textSub }]}>Transcription des déclarations *</Text>
                <Ionicons name="create-outline" size={18} color={primaryColor} />
            </View>
            
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
              multiline
              placeholder={"Q : ...\nR : ..."}
              placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
              value={statement}
              onChangeText={setStatement}
              textAlignVertical="top"
            />

            {/* AVERTISSEMENT */}
            <View style={[styles.legalNotice, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2", borderColor: isDark ? "#991B1B" : "#FCA5A5" }]}>
              <Ionicons name="alert-circle" size={20} color={isDark ? "#FCA5A5" : "#EF4444"} />
              <Text style={[styles.noticeText, { color: isDark ? "#FCA5A5" : "#B91C1C" }]}>
                Notice : Le scellement numérique vaut signature officielle de l'Officier OPJ.
              </Text>
            </View>

            {/* VALIDATION */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.submitBtn, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }]}
              onPress={handleSaveStatement}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="ribbon-outline" size={22} color="#FFF" />
                  <Text style={styles.submitText}>SIGNER ET SCELLER L'AUDITION</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 120 },
  headerCard: { borderLeftWidth: 6, padding: 20, borderRadius: 20, marginBottom: 25, elevation: 2 },
  miniLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  suspectName: { fontSize: 22, fontWeight: "900" },
  caseRef: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  lawyerToggle: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, borderWidth: 1.5, marginBottom: 30, gap: 12 },
  lawyerText: { fontWeight: '800', fontSize: 15 },
  lawyerSub: { fontSize: 11, marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
  inputLabel: { fontSize: 11, fontWeight: "900", textTransform: 'uppercase' },
  textArea: { borderRadius: 20, borderWidth: 1.5, padding: 20, minHeight: 350, fontSize: 16, lineHeight: 24, marginBottom: 25 },
  legalNotice: { flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', gap: 10, marginBottom: 35, borderWidth: 1 },
  noticeText: { flex: 1, fontSize: 11, fontWeight: '700', fontStyle: 'italic' },
  submitBtn: { flexDirection: "row", height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", gap: 10, elevation: 4 },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 15 }
});