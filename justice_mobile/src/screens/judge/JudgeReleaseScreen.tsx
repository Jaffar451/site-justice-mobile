import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint, updateComplaintStatus } from "../../services/complaint.service";

// ✅ Correction du typage de la route
export default function JudgeReleaseScreen({ route, navigation }: JudgeScreenProps<'JudgeRelease'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const params = route.params as any;
  const { caseId, personName = "Le Prévenu" } = params || { caseId: 0 };

  const [releaseType, setReleaseType] = useState<"provisional" | "final">("provisional");
  const [conditions, setConditions] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    successBg: isDark ? "#064E3B" : "#F0FDF4",
    successText: isDark ? "#6EE7B7" : "#10B981",
  };

  const handleConfirmRelease = async () => {
    if (releaseType === "provisional" && !conditions.trim()) {
      const msg = "Veuillez définir les obligations du contrôle judiciaire.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Précision requise", msg);
      return;
    }

    const title = "SIGNER L'ÉLARGISSEMENT";
    const msg = `Confirmez-vous la mise en liberté de ${personName} ? L'ordre sera transmis au Régisseur.`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) executeRelease();
    } else {
        Alert.alert(title, msg, [
          { text: "Annuler", style: "cancel" },
          { text: "Signer l'Ordre", style: "destructive", onPress: executeRelease },
        ]);
    }
  };

  const executeRelease = async () => {
    setLoading(true);
    try {
      // Détermination du nouveau statut du dossier
      // Si provisoire -> dossier reste en instruction (ou statut spécifique "liberte_provisoire")
      // Si définitive -> dossier clos (non-lieu)
      const newStatus = releaseType === "final" ? "non_lieu" : "instruction";

      await updateComplaint(caseId, {
        releaseDetails: {
          type: releaseType,
          conditions: conditions.trim(),
          signedAt: new Date().toISOString(),
          judgeSignature: `RELEASE-SIG-${user?.id}-${Date.now()}`
        }
      } as any);

      await updateComplaintStatus(caseId, newStatus);
      
      if (Platform.OS === 'web') window.alert("✅ Ordre d'élargissement transmis.");
      
      // Retour au dashboard
      navigation.navigate("JudgeDashboard");
    } catch (error) {
      Alert.alert("Erreur de Transmission", "L'acte n'a pas pu être signé numériquement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Mise en Liberté" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* 🏛️ ENTÊTE OFFICIEL DE L'ACTE */}
          <View style={[styles.headerBox, { backgroundColor: colors.successBg, borderColor: colors.successText }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#065F46" : "#DCFCE7" }]}>
              <Ionicons name="lock-open" size={32} color={colors.successText} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.caseIdText, { color: colors.successText }]}>ACTE D'ÉLARGISSEMENT RG #{caseId}</Text>
              <Text style={[styles.personName, { color: colors.textMain }]}>{personName.toUpperCase()}</Text>
              <Text style={[styles.signedText, { color: colors.textSub }]}>
                M. le Juge {user?.lastname?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* SÉLECTION DU TYPE DE LIBÉRATION */}
          <Text style={[styles.label, { color: colors.textSub }]}>Nature de la mesure d'élargissement *</Text>
          <View style={styles.optionRow}>
            {[
              { id: "provisional", label: "Liberté Provisoire", icon: "time-outline" },
              { id: "final", label: "Liberté Définitive", icon: "checkmark-done-circle-outline" }
            ].map((item) => {
              const isSelected = releaseType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[
                    styles.optionBtn,
                    { 
                      backgroundColor: isSelected ? "#10B981" : colors.bgCard, 
                      borderColor: isSelected ? "#10B981" : colors.border 
                    }
                  ]}
                  onPress={() => setReleaseType(item.id as any)}
                >
                  <Ionicons name={item.icon as any} size={24} color={isSelected ? "#FFF" : colors.textSub} />
                  <Text style={[styles.optionText, { color: isSelected ? "#FFF" : colors.textMain }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* MOTIFS ET CONDITIONS */}
          <Text style={[styles.label, { color: colors.textSub }]}>Motifs et Obligations du Contrôle *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Obligations du contrôle judiciaire (ex: pointage, interdiction de paraître)..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            multiline
            numberOfLines={6}
            value={conditions}
            onChangeText={setConditions}
            textAlignVertical="top"
          />

          {/* INFORMATION LÉGALE */}
          <View style={[styles.warningBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
            <Ionicons name="information-circle" size={20} color="#10B981" />
            <Text style={[styles.warningText, { color: colors.textSub }]}>
              Rappel : Cet ordre doit être exécuté sans délai par l'autorité pénitentiaire sous peine de poursuites pour détention arbitraire.
            </Text>
          </View>

          {/* BOUTON DE SIGNATURE NUMÉRIQUE */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.releaseBtn, { backgroundColor: "#10B981" }, loading && { opacity: 0.7 }]}
            onPress={handleConfirmRelease}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="ribbon-outline" size={22} color="#FFF" />
                <Text style={styles.releaseBtnText}>SIGNER L'ORDRE D'ÉLARGISSEMENT</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerBox: { flexDirection: "row", alignItems: "center", padding: 22, borderRadius: 24, marginBottom: 30, borderWidth: 2 },
  iconCircle: { width: 68, height: 68, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  headerInfo: { marginLeft: 18, flex: 1 },
  caseIdText: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  personName: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  signedText: { fontSize: 12, marginTop: 4, fontWeight: '700', fontStyle: 'italic' },
  
  label: { fontSize: 11, fontWeight: "900", marginBottom: 12, marginTop: 15, textTransform: 'uppercase', letterSpacing: 1 },
  optionRow: { flexDirection: "row", gap: 12, marginBottom: 30 },
  optionBtn: { flex: 1, height: 90, borderRadius: 20, borderWidth: 1.5, alignItems: "center", justifyContent: "center", gap: 10, elevation: 2 },
  optionText: { fontSize: 11, fontWeight: "900", textAlign: "center" },
  
  input: { borderRadius: 18, padding: 20, borderWidth: 1.5, fontSize: 15, height: 180, fontWeight: '600', lineHeight: 22 },
  
  warningBox: { flexDirection: "row", alignItems: "center", marginTop: 30, padding: 18, borderRadius: 16, gap: 15, borderWidth: 1 },
  warningText: { fontSize: 12, flex: 1, fontStyle: "italic", lineHeight: 18, fontWeight: '600' },
  
  releaseBtn: { 
    flexDirection: "row", 
    height: 64, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 35, 
    gap: 12,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
        android: { elevation: 6 },
        web: { boxShadow: "0px 4px 15px rgba(0,0,0,0.15)" }
    })
  },
  releaseBtnText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});