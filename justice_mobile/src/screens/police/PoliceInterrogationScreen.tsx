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

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants de mise en page
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceInterrogationScreen({ route, navigation }: PoliceScreenProps<'PoliceInterrogation'>) {
  // ✅ 2. Thème & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary; 
  const { user } = useAuthStore();
  
  const params = route.params as any;
  const complaintId = params?.complaintId || params?.caseId || 0;
  const suspectName = params?.suspectName || "Le Prévenu";

  const [statement, setStatement] = useState(""); 
  const [lawyerPresent, setLawyerPresent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
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
    if (statement.trim().length < 50) {
      const msg = "L'audition doit être détaillée (Min. 50 caractères) pour être valide.";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Saisie insuffisante", msg);
      return;
    }

    Alert.alert(
      "Clôture de l'Audition ⚖️",
      "Confirmez-vous le scellage de ce procès-verbal numérique ?",
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Signer & Sceller", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await updateComplaint(complaintId, {
                interrogationContent: statement.trim(),
                lawyerPresence: lawyerPresent,
                interrogationDate: new Date().toISOString(),
                status: "en_cours_OPJ",
                signingOfficer: `${user?.firstname} ${user?.lastname}`
              } as any);

              Alert.alert("Acte Certifié ✅", "Le PV a été signé numériquement.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erreur Système", "Échec de l'enregistrement sécurisé.");
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
      <StatusBar barStyle="light-content" />
      <AppHeader title="Audition Judiciaire" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* 🏛️ BANDEAU DU PRÉVENU */}
          <View style={[styles.headerCard, { borderLeftColor: primaryColor, backgroundColor: colors.headerCard, shadowColor: "#000" }]}>
            <Text style={[styles.miniLabel, { color: primaryColor }]}>PROCÈS-VERBAL D'AUDITION</Text>
            <Text style={[styles.suspectName, { color: colors.textMain }]}>{suspectName.toUpperCase()}</Text>
            <Text style={[styles.caseRef, { color: colors.textSub }]}>Réf. Dossier : RG #{complaintId}</Text>
          </View>

          {/* 🛡️ DROITS DE LA DÉFENSE */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[
              styles.lawyerToggle, 
              { 
                borderColor: lawyerPresent ? primaryColor : colors.border,
                backgroundColor: lawyerPresent ? primaryColor + "15" : colors.bgCard
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

          {/* ✍️ TRANSCRIPTION DU PV */}
          <View style={styles.inputHeader}>
              <Text style={[styles.inputLabel, { color: colors.textSub }]}>Transcription des déclarations *</Text>
              <Ionicons name="create-outline" size={18} color={primaryColor} />
          </View>
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
            multiline
            placeholder={"Utilisez le format Q/R :\n\nQ : Confirmez-vous les faits ?\nR : Oui, je reconnais..."}
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={statement}
            onChangeText={setStatement}
            textAlignVertical="top"
          />

          {/* ℹ️ AVERTISSEMENT LÉGAL */}
          <View style={[styles.legalNotice, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2", borderColor: isDark ? "#991B1B" : "#FCA5A5" }]}>
            <Ionicons name="alert-circle" size={20} color={isDark ? "#FCA5A5" : "#EF4444"} />
            <Text style={[styles.noticeText, { color: isDark ? "#FCA5A5" : "#B91C1C" }]}>
              L'altération de cet acte numérique constitue un faux en écriture publique (Code Pénal).
            </Text>
          </View>

          {/* 💾 VALIDATION ET SIGNATURE */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitBtn, { backgroundColor: primaryColor }]}
            onPress={handleSaveStatement}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="ribbon-outline" size={24} color="#FFF" />
                <Text style={styles.submitText}>VALIDER ET SCELLER LE PV</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 140 },
  headerCard: { borderLeftWidth: 8, padding: 22, borderRadius: 24, marginBottom: 30, elevation: 2 },
  miniLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 6 },
  suspectName: { fontSize: 24, fontWeight: "900" },
  caseRef: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  
  lawyerToggle: { 
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 22, 
    borderWidth: 2, marginBottom: 35, gap: 15 
  },
  lawyerText: { fontWeight: '800', fontSize: 15 },
  lawyerSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },

  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  inputLabel: { fontSize: 11, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 1 },
  
  textArea: {
    borderRadius: 24, borderWidth: 2,
    padding: 22, minHeight: 400, fontSize: 16, lineHeight: 26, marginBottom: 25, 
    fontWeight: '500',
  },
  
  legalNotice: { 
    flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: 'center', 
    gap: 12, marginBottom: 40, borderStyle: 'dashed', borderWidth: 1.2
  },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '700', fontStyle: 'italic' },
  
  submitBtn: {
    flexDirection: "row", height: 64, borderRadius: 22, 
    justifyContent: "center", alignItems: "center", gap: 12, elevation: 6,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 }
});