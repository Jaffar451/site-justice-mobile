// PATH: src/screens/judge/JudgeAppealScreen.tsx
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
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Theme
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import { registerAppeal } from "../../services/appeal.service";

export default function JudgeAppealScreen({ route, navigation }: JudgeScreenProps<'JudgeAppeal'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  // Identité "Recours" Orange
  const APPEAL_ACCENT = "#F57C00"; 

  // Récupération sécurisée des paramètres de navigation
  const { caseId, personName = "Le Prévenu" } = route.params;

  // États du formulaire judiciaire
  const [appellant, setAppellant] = useState<"DEFENDANT" | "PROSECUTOR" | "CIVIL_PARTY">("DEFENDANT");
  const [grounds, setGrounds] = useState("");
  const [suspensive, setSuspensive] = useState(true); 
  const [loading, setLoading] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    headerBg: isDark ? "#432706" : "#FFF8E1",
  };

  /**
   * ✍️ VALIDATION DE L'ACTE D'APPEL
   */
  const handleConfirmAppeal = () => {
    if (grounds.trim().length < 15) {
      const msg = "Veuillez préciser les motifs de l'appel (min. 15 caractères).";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Données insuffisantes", msg);
      return;
    }

    const title = "Déclaration de Recours ⚖️";
    const msg = `En enregistrant cet appel, vous saisissez la Cour d'Appel pour le dossier RP-${caseId}/26. Confirmer ?`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) submitAppeal();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer le Recours", style: "destructive", onPress: submitAppeal }
        ]);
    }
  };

  const submitAppeal = async () => {
    setLoading(true);
    try {
      // ✅ Certification de l'appel sur le serveur judiciaire
      await registerAppeal({
        caseId: Number(caseId),
        appellant,
        grounds: grounds.trim(),
        isSuspensive: suspensive,
        filedBy: user?.id,
        date: new Date().toISOString()
      });
      
      const successMsg = "L'acte d'appel a été scellé numériquement et transmis au Greffe de la Cour.";
      
      if (Platform.OS === 'web') window.alert(`✅ Success: ${successMsg}`);
      else Alert.alert("Appel Enregistré", successMsg);
      
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erreur de Liaison", "Impossible de joindre le serveur du Greffe Central.");
    } finally {
      setLoading(false);
    }
  };

  const appellantLabels = {
    DEFENDANT: `Inculpé : ${personName}`,
    PROSECUTOR: "Ministère Public (Parquet)",
    CIVIL_PARTY: "Partie Civile (Victime)"
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Déclaration d'Appel" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* 🏛️ BANDEAU D'APPEL */}
          <View style={[styles.headerCard, { backgroundColor: colors.headerBg, borderColor: APPEAL_ACCENT }]}>
            <Ionicons name="git-branch" size={28} color={APPEAL_ACCENT} />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={[styles.headerTitle, { color: isDark ? "#FFB74D" : "#E65100" }]}>
                SAISINE DE LA COUR D'APPEL
              </Text>
              <Text style={[styles.headerSub, { color: colors.textMain }]}>
                Dossier N° RP-{caseId}/26 • Cabinet d'Instruction
              </Text>
            </View>
          </View>

          {/* 🔘 SÉLECTION DE LA PARTIE APPELANTE */}
          <Text style={[styles.label, { color: colors.textSub }]}>Auteur du recours *</Text>
          <View style={styles.radioGroup}>
            {(Object.keys(appellantLabels) as Array<keyof typeof appellantLabels>).map((type) => {
              const isSelected = appellant === type;
              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.8}
                  style={[
                    styles.radioBtn,
                    { 
                      backgroundColor: isSelected ? APPEAL_ACCENT : colors.bgCard,
                      borderColor: isSelected ? APPEAL_ACCENT : colors.border
                    }
                  ]}
                  onPress={() => setAppellant(type)}
                >
                  <Ionicons 
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                    size={18} 
                    color={isSelected ? "#FFF" : colors.textSub} 
                  />
                  <Text style={[styles.radioText, { color: isSelected ? "#FFF" : colors.textMain }]}>
                    {type === "DEFENDANT" ? "Prévenu" : type === "PROSECUTOR" ? "Parquet" : "Victime"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.helperBox, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
             <Text style={[styles.helperText, { color: colors.textSub }]}>{appellantLabels[appellant]}</Text>
          </View>

          {/* ✍️ MOYENS D'APPEL */}
          <Text style={[styles.label, { color: colors.textSub }]}>Motifs de la contestation (Moyens) *</Text>
          <TextInput
            style={[
              styles.textArea, 
              { 
                backgroundColor: colors.inputBg, 
                borderColor: colors.border,
                color: colors.textMain
              }
            ]}
            placeholder="Ex: Contestation de la régularité de la procédure, remise en cause des charges retenues..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            multiline
            numberOfLines={8}
            value={grounds}
            onChangeText={setGrounds}
            textAlignVertical="top"
          />

          {/* 🔄 EFFET SUSPENSIF */}
          <View style={[styles.switchContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: colors.textMain }]}>Effet Suspensif</Text>
              <Text style={[styles.switchDesc, { color: colors.textSub }]}>
                Suspend l'exécution du jugement jusqu'à l'arrêt de la Cour.
              </Text>
            </View>
            <Switch
              value={suspensive}
              onValueChange={setSuspensive}
              trackColor={{ false: "#767577", true: APPEAL_ACCENT }}
            />
          </View>

          {/* 🚀 BOUTON SIGNATURE */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: APPEAL_ACCENT }]}
            onPress={handleConfirmAppeal}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="document-text" size={24} color="#FFF" />
                <Text style={styles.submitBtnText}>SCELLER L'ACTE D'APPEL</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.legalNotice}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.textSub} />
            <Text style={[styles.noticeText, { color: colors.textSub }]}>
              La déclaration d'appel numérique a la même valeur que le registre papier du Greffe.
            </Text>
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 30,
    elevation: 3
  },
  headerTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  headerSub: { fontSize: 14, marginTop: 4, fontWeight: "800" },
  label: { fontSize: 11, fontWeight: "900", marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  radioGroup: { flexDirection: "row", flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  radioBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1.5,
    gap: 10,
    minWidth: '30%',
    elevation: 2
  },
  radioText: { fontWeight: "900", fontSize: 12 },
  helperBox: { padding: 12, borderRadius: 10, marginBottom: 30, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  helperText: { fontSize: 12, fontWeight: "700", fontStyle: "italic" },
  textArea: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    minHeight: 200,
    fontSize: 16,
    marginBottom: 25,
    lineHeight: 24
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    borderRadius: 24,
    marginBottom: 40,
    borderWidth: 1.5,
    elevation: 2
  },
  switchTitle: { fontWeight: "900", fontSize: 16 },
  switchDesc: { fontSize: 12, marginTop: 4, marginRight: 30, lineHeight: 18, fontWeight: "500", opacity: 0.8 },
  submitBtn: {
    flexDirection: "row",
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  submitBtnText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },
  legalNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 30, opacity: 0.6 },
  noticeText: { fontSize: 11, fontWeight: '700', fontStyle: 'italic', textAlign: 'center' }
});