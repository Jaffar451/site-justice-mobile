import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
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

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceCustodyExtensionScreen({ route, navigation }: PoliceScreenProps<'PoliceCustodyExtension'>) {
  // ✅ 2. Thème & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary; 
  const { user } = useAuthStore();
  
  const params = route.params as any;
  const { caseId, suspectName = "Individu gardé à vue" } = params || { caseId: 0 };

  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  const handleRequestExtension = async () => {
    if (reason.trim().length < 15) {
      return Alert.alert(
        "Motivation insuffisante", 
        "Veuillez détailler les nécessités de l'enquête justifiant cette prolongation (min. 15 caractères)."
      );
    }

    Alert.alert(
      "Saisine du Parquet",
      `Souhaitez-vous transmettre cette demande de prolongation de +${duration}h pour ${suspectName} au Procureur de la République ?`,
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Transmettre la requête", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await updateComplaint(caseId, {
                custodyExtensionRequested: true,
                extensionReason: reason,
                requestedDuration: duration,
                extensionStatus: "pending_prosecutor",
                requestingOfficer: `${user?.firstname} ${user?.lastname}`
              } as any);

              Alert.alert(
                "Requête Envoyée ✅",
                "Le Procureur a été saisi numériquement. Vous recevrez une notification dès que l'ordonnance sera signée.",
                [{ text: "Retour au dossier", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert("Erreur", "La transmission sécurisée vers le Parquet a échoué.");
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
      <AppHeader title="Requête de Prolongation" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollPadding} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* 🏛️ RÉSUMÉ DU DOSSIER */}
          <View style={[styles.infoCard, { backgroundColor: colors.bgCard, borderLeftColor: primaryColor, shadowColor: "#000" }]}>
            <View style={[styles.iconBox, { backgroundColor: primaryColor + "15" }]}>
                <Ionicons name="hourglass" size={24} color={primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: primaryColor }]}>PROCÉDURE RG #{caseId}</Text>
              <Text style={[styles.infoSuspect, { color: colors.textMain }]}>{suspectName.toUpperCase()}</Text>
            </View>
          </View>

          {/* ⏳ CHOIX DE LA DURÉE */}
          <Text style={[styles.inputLabel, { color: colors.textSub }]}>Délai supplémentaire requis *</Text>
          <View style={styles.durationRow}>
            {["24", "48"].map((h) => {
              const isActive = duration === h;
              return (
                <TouchableOpacity
                  key={h}
                  activeOpacity={0.8}
                  style={[
                    styles.durationBtn,
                    { 
                        backgroundColor: isActive ? primaryColor : colors.bgCard,
                        borderColor: isActive ? primaryColor : colors.border 
                    }
                  ]}
                  onPress={() => setDuration(h)}
                >
                  <Text style={[styles.durationText, { color: isActive ? "#FFF" : colors.textMain }]}>+{h} HEURES</Text>
                  <Text style={[styles.durationSub, { color: isActive ? "rgba(255,255,255,0.7)" : colors.textSub }]}>Extension GAV</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ✍️ JUSTIFICATION */}
          <Text style={[styles.inputLabel, { color: colors.textSub }]}>Motivations de l'acte *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
            multiline
            numberOfLines={6}
            placeholder="Ex: Poursuite des auditions, attente de retour de perquisition..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />

          {/* 🚀 ACTION DE SAISINE */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitBtn, { backgroundColor: primaryColor }]}
            onPress={handleRequestExtension}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#FFF" />
                <Text style={styles.submitText}>SAISIR LE PARQUET</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* ℹ️ NOTICE DE PROCÉDURE */}
          <View style={[styles.legalNotice, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={[styles.warningNote, { color: colors.textSub }]}>
              Rappel : La prolongation est une mesure exceptionnelle. Tout retard de présentation au Procureur après le délai légal peut entraîner la mise en liberté immédiate du gardé à vue.
            </Text>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 140 },
  
  infoCard: { 
    flexDirection: 'row', 
    padding: 22, 
    borderRadius: 22, 
    alignItems: 'center', 
    marginBottom: 35,
    borderLeftWidth: 8,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }
    })
  },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  infoLabel: { fontWeight: '900', fontSize: 10, letterSpacing: 1.5 },
  infoSuspect: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  
  inputLabel: { fontSize: 11, fontWeight: "900", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  durationRow: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  durationBtn: { flex: 1, padding: 22, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  durationText: { fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  durationSub: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  
  textArea: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 22,
    minHeight: 200,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 35,
    fontWeight: '500',
  },
  
  submitBtn: {
    flexDirection: "row",
    height: 64,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  
  legalNotice: { 
    flexDirection: 'row', 
    padding: 20, 
    borderRadius: 18, 
    marginTop: 40, 
    gap: 15, 
    alignItems: 'center', 
    borderWidth: 1,
  },
  warningNote: { flex: 1, fontSize: 12, fontStyle: 'italic', lineHeight: 18, fontWeight: '600' }
});