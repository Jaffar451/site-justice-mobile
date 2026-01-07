import React, { useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceDetentionScreen({ route, navigation }: PoliceScreenProps<'PoliceDetention'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary; 
  const { user } = useAuthStore();
  
  const params = route.params as any;
  const complaintId = params?.id || params?.complaintId; // Protection double clé
  const suspectName = params?.suspectName || "Individu à écrouer";

  const [cellNumber, setCellNumber] = useState("");
  const [itemsSeized, setItemsSeized] = useState(""); 
  const [physicalState, setPhysicalState] = useState("Normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    headerCard: primaryColor,
  };

  const handleFinalizeDetention = async () => {
    // 🛡️ SÉCURITÉ : Validation ID et Formulaire
    if (!complaintId || complaintId === 'undefined') {
      return Alert.alert("Erreur", "Identifiant du dossier corrompu.");
    }

    if (!cellNumber.trim()) {
      return Alert.alert("Donnée manquante", "Le numéro de local ou de cellule est obligatoire.");
    }

    Alert.alert(
      "Inscription au Registre d'Écrou ⚖️",
      `Confirmez-vous le placement effectif de ${suspectName.toUpperCase()} ?`,
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Valider l'Écrou", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              // ✅ Envoi propre au service
              await updateComplaint(Number(complaintId), {
                detentionCell: cellNumber.trim(),
                inventory: itemsSeized.trim() || "Néant (Fouille négative)",
                healthStatusAtDetention: physicalState,
                detentionRegisteredAt: new Date().toISOString(),
                officerInCharge: `${user?.firstname} ${user?.lastname}`,
                status: "en_cours_OPJ", 
                isInCustody: true 
              } as any);

              Alert.alert("Acte Scellé ✅", "L'inscription au registre d'écrou a été certifiée numériquement.");
              navigation.popToTop(); // Retour à l'accueil Police
            } catch (error) {
              console.error("Detention Error:", error);
              Alert.alert("Erreur Système", "Échec de synchronisation avec le registre central.");
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
      <AppHeader title="Registre d'Écrou" showBack={true} />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollPadding}
            keyboardShouldPersistTaps="handled" // ✅ Débloque l'interaction tactile
            showsVerticalScrollIndicator={false}
          >
            {/* 🏛️ BANDEAU D'IDENTIFICATION */}
            <View style={[styles.headerCard, { backgroundColor: colors.headerCard }]}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={28} color={primaryColor} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Placement sous écrou</Text>
                <Text style={styles.headerSub}>SUJET : {suspectName.toUpperCase()}</Text>
                <Text style={styles.headerSub}>DOSSIER : RP #{complaintId}</Text>
              </View>
            </View>

            {/* 🚪 AFFECTATION CELLULE */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: colors.textSub }]}>Local / Cellule d'affectation *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
                  placeholder="Ex: Cellule n°2, Secteur A"
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  value={cellNumber}
                  onChangeText={setCellNumber}
                />
            </View>

            {/* 🎒 INVENTAIRE DE FOUILLE */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: colors.textSub }]}>Objets consignés (Inventaire)</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
                  multiline
                  numberOfLines={5}
                  placeholder="Ceinture, téléphone, numéraire..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  value={itemsSeized}
                  onChangeText={setItemsSeized}
                  textAlignVertical="top"
                />
            </View>

            {/* 🩺 ÉTAT SANITAIRE */}
            <Text style={[styles.label, { color: colors.textSub }]}>État physique à l'entrée</Text>
            <View style={styles.optionsRow}>
              {["Normal", "Blessé", "Agité"].map((state) => {
                const isActive = physicalState === state;
                const stateColor = state === "Normal" ? "#10B981" : state === "Blessé" ? "#EF4444" : "#F59E0B";
                
                return (
                  <TouchableOpacity
                    key={state}
                    activeOpacity={0.7}
                    style={[
                      styles.optionBtn,
                      { borderColor: colors.border, backgroundColor: colors.bgCard },
                      isActive && { backgroundColor: stateColor, borderColor: stateColor }
                    ]}
                    onPress={() => setPhysicalState(state)}
                  >
                    <Text style={[
                        styles.optionText, 
                        { color: isActive ? "#FFF" : colors.textSub }
                    ]}>{state.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 💾 VALIDATION OFFICIELLE */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.submitBtn, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }]}
              onPress={handleFinalizeDetention}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#FFF" style={{marginRight: 8}} />
                  <Text style={styles.submitText}>SCELLER L'INSCRIPTION</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerNote}>
                <Ionicons name="finger-print-outline" size={18} color={colors.textSub} />
                <Text style={[styles.footerNoteText, { color: colors.textSub }]}>
                  Acte certifié par l'Officier OPJ en charge.
                </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 120 },
  headerCard: { 
    flexDirection: 'row', 
    padding: 22, 
    borderRadius: 24, 
    alignItems: 'center', 
    marginBottom: 30, 
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  iconCircle: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  headerText: { marginLeft: 15, flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2, fontWeight: '700' },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "900", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderRadius: 16, borderWidth: 2, padding: 15, fontSize: 16, fontWeight: '700' },
  textArea: { borderRadius: 16, borderWidth: 2, padding: 15, minHeight: 120, fontSize: 15, fontWeight: '600' },
  optionsRow: { flexDirection: 'row', gap: 10, marginBottom: 35 },
  optionBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontWeight: '900', fontSize: 10 },
  submitBtn: { 
    flexDirection: "row", 
    height: 60, 
    borderRadius: 18, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 30, opacity: 0.6 },
  footerNoteText: { fontSize: 11, fontWeight: '700', fontStyle: 'italic' }
});