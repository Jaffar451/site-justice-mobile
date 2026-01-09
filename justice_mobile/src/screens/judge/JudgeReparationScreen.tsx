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
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateDecision } from "../../services/decision.service";

export default function JudgeReparationScreen({ route, navigation }: JudgeScreenProps<'JudgeReparation'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  // Sécurisation des paramètres
  const params = route.params as { caseId: number; decisionId?: number } | undefined;
  const caseId = params?.caseId || "N/A";
  const decisionId = params?.decisionId;

  const [moralDamage, setMoralDamage] = useState("");
  const [materialDamage, setMaterialDamage] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    infoBg: isDark ? "#0C4A6E" : "#F0F9FF",
    totalBg: isDark ? "#0F172A" : "#F8FAFC",
  };

  const total = (Number(moralDamage) || 0) + (Number(materialDamage) || 0);

  const handleSaveReparation = async () => {
    if (!moralDamage && !materialDamage) {
      const msg = "Veuillez saisir au moins un montant de réparation.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Montant requis", msg);
      return;
    }

    if (!decisionId) {
       Alert.alert("Erreur", "Aucune décision associée à ce dossier.");
       return;
    }

    if (!justification.trim() || justification.trim().length < 15) {
      const msg = "Veuillez justifier précisément le calcul des indemnités (min. 15 car.).";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Motivation requise", msg);
      return;
    }

    const title = "Ordonnance Civile";
    const msg = `Confirmez-vous l'allocation de ${total.toLocaleString()} FCFA à la partie civile ?`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) executeSave();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer l'Acte", onPress: executeSave }
        ]);
    }
  };

  const executeSave = async () => {
    setLoading(true);
    try {
      const payload = {
        reparations: {
          moral: Number(moralDamage) || 0,
          material: Number(materialDamage) || 0,
          total: total,
        },
        reparationJustification: justification.trim(),
        // Note: 'signedBy' n'est pas dans l'interface stricte, on l'omet ou on l'ajoute si nécessaire
        judgeSignature: `CIVIL-SIG-${user?.id}-${Date.now()}`,
        updatedAt: new Date().toISOString()
      };

      // Cast 'as any' pour passer outre la vérification stricte temporaire
      await updateDecision(decisionId!, payload as any);
      
      const successMsg = "Ordonnance civile enregistrée avec succès.";
      if (Platform.OS === 'web') window.alert(`✅ ${successMsg}`);
      else Alert.alert("Succès", successMsg);
      
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'enregistrement des réparations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Intérêts Civils" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* 🏛️ BANDEAU DU DOSSIER */}
          <View style={[styles.infoBox, { backgroundColor: colors.infoBg, borderLeftColor: primaryColor, borderColor: colors.border }]}>
            <Ionicons name="cash-outline" size={24} color={isDark ? "#7DD3FC" : primaryColor} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.infoText, { color: isDark ? "#E0F2FE" : "#1E293B" }]}>
                  Fixation des réparations civiles
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? "#7DD3FC" : "#64748B", fontWeight: '800' }}>
                  Dossier RG #{caseId}
                </Text>
            </View>
          </View>

          {/* PRÉJUDICE MATÉRIEL */}
          <Text style={[styles.label, { color: colors.textSub }]}>Préjudice Matériel (FCFA)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Montant des pertes physiques ou financières..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            keyboardType="numeric"
            value={materialDamage}
            onChangeText={setMaterialDamage}
          />

          {/* PRÉJUDICE MORAL */}
          <Text style={[styles.label, { color: colors.textSub }]}>Préjudice Moral (FCFA)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Montant pour souffrance ou atteinte à l'honneur..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            keyboardType="numeric"
            value={moralDamage}
            onChangeText={setMoralDamage}
          />

          {/* MOTIVATION */}
          <Text style={[styles.label, { color: colors.textSub }]}>Motivation du calcul *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Détaillez les preuves ou rapports d'expertise justifiant ces indemnités..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            multiline
            numberOfLines={6}
            value={justification}
            onChangeText={setJustification}
            textAlignVertical="top"
          />

          {/* 📊 RÉCAPITULATIF FINANCIER */}
          <View style={[styles.totalBox, { backgroundColor: colors.totalBg, borderColor: primaryColor }]}>
            <Text style={[styles.totalLabel, { color: colors.textSub }]}>TOTAL ALLOUÉ À LA PARTIE CIVILE</Text>
            <Text style={[styles.totalAmount, { color: primaryColor }]}>
              {total.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>

          {/* BOUTON DE SIGNATURE */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.saveBtn, { backgroundColor: primaryColor }, loading && { opacity: 0.7 }]}
            onPress={handleSaveReparation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="ribbon-outline" size={22} color="#fff" />
                <Text style={styles.saveBtnText}>SIGNER L'ORDONNANCE CIVILE</Text>
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
  infoBox: { flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 20, marginBottom: 30, borderLeftWidth: 8, elevation: 2, borderWidth: 1 },
  infoText: { fontSize: 16, fontWeight: "900", letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: "900", marginBottom: 12, marginTop: 18, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderRadius: 16, padding: 18, borderWidth: 1.5, fontSize: 16, fontWeight: '700' },
  textArea: { height: 140, lineHeight: 22 },
  totalBox: { marginTop: 35, padding: 30, borderRadius: 24, alignItems: "center", borderWidth: 2, borderStyle: 'dashed' },
  totalLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  totalAmount: { fontSize: 36, fontWeight: "900", marginTop: 10 },
  saveBtn: { 
    flexDirection: "row", 
    height: 64, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 40, 
    gap: 12,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
        android: { elevation: 6 },
        web: { boxShadow: "0px 4px 15px rgba(0,0,0,0.15)" }
    })
  },
  saveBtnText: { color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});