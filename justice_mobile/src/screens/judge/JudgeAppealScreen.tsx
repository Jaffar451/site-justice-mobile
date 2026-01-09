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

// ✅ 1. Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Import du Service Réel
import { registerAppeal } from "../../services/appeal.service";

export default function JudgeAppealScreen({ route, navigation }: JudgeScreenProps<'JudgeAppeal'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  // Sécurisation des paramètres
  const params = route.params as { caseId: number; personName?: string };
  const caseId = params?.caseId;
  const personName = params?.personName || "Le Prévenu";

  // États du formulaire
  const [appellant, setAppellant] = useState<"DEFENDANT" | "PROSECUTOR" | "CIVIL_PARTY">("DEFENDANT");
  const [grounds, setGrounds] = useState("");
  const [suspensive, setSuspensive] = useState(true); 
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
    appealPrimary: "#F57C00", // Orange Recours
    appealBg: isDark ? "#432706" : "#FFF8E1",
  };

  const handleConfirmAppeal = () => {
    if (!grounds.trim()) {
      const msg = "Veuillez préciser les moyens d'appel pour la Cour (min. 10 caractères).";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Motivation requise", msg);
      return;
    }

    const title = "Signature de l'Acte";
    const msg = "Cet acte suspend l'exécution (sauf provisoire) et saisit la Cour d'Appel. Confirmer ?";

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) submitAppeal();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Enregistrer l'Appel", style: "destructive", onPress: submitAppeal }
        ]);
    }
  };

  const submitAppeal = async () => {
    if (!caseId) return Alert.alert("Erreur", "Identifiant du dossier manquant.");

    setLoading(true);
    try {
      // ✅ Appel API Réel
      await registerAppeal({
        caseId: Number(caseId),
        appellant,
        grounds: grounds.trim(),
        isSuspensive: suspensive,
        filedBy: user?.id,
        date: new Date().toISOString()
      });
      
      const successMsg = "Recours Enregistré : La déclaration d'appel a été versée au dossier numérique.";
      
      if (Platform.OS === 'web') window.alert(`✅ ${successMsg}`);
      else Alert.alert("Recours Enregistré", successMsg);
      
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur de Greffe", error.message || "L'enregistrement de l'acte a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const appellantLabels = {
    DEFENDANT: `Le Prévenu (${personName})`,
    PROSECUTOR: "Le Ministère Public (Parquet)",
    CIVIL_PARTY: "La Partie Civile (Victime)"
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
          <View style={[styles.headerCard, { backgroundColor: colors.appealBg, borderColor: colors.appealPrimary }]}>
            <Ionicons name="git-branch" size={28} color={colors.appealPrimary} />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={[styles.headerTitle, { color: isDark ? "#FFB74D" : "#E65100" }]}>
                SAISINE DE LA COUR D'APPEL
              </Text>
              <Text style={[styles.headerSub, { color: colors.textMain }]}>
                Dossier RG #{caseId} • Juge : {user?.lastname?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* 1. SÉLECTION DE LA PARTIE */}
          <Text style={[styles.label, { color: colors.textSub }]}>Partie Appelante</Text>
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
                      backgroundColor: isSelected ? colors.appealPrimary : colors.bgCard,
                      borderColor: isSelected ? colors.appealPrimary : colors.border
                    }
                  ]}
                  onPress={() => setAppellant(type)}
                >
                  <Ionicons 
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={isSelected ? "#FFF" : colors.textSub} 
                  />
                  <Text style={[styles.radioText, { color: isSelected ? "#FFF" : colors.textMain }]}>
                    {type === "DEFENDANT" ? "Prévenu" : type === "PROSECUTOR" ? "Parquet" : "Partie Civile"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.helperText, { color: isDark ? "#FFB74D" : colors.appealPrimary }]}>{appellantLabels[appellant]}</Text>

          {/* 2. MOYENS D'APPEL */}
          <Text style={[styles.label, { color: colors.textSub }]}>Moyens d'Appel (Points contestés) *</Text>
          <TextInput
            style={[
              styles.textArea, 
              { 
                backgroundColor: colors.inputBg, 
                borderColor: colors.border,
                color: colors.textMain
              }
            ]}
            placeholder="Ex: Contestation de la qualification des faits, quantum de la peine..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            multiline
            numberOfLines={6}
            value={grounds}
            onChangeText={setGrounds}
            textAlignVertical="top"
          />

          {/* 3. EFFET SUSPENSIF */}
          <View style={[styles.switchContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: colors.textMain }]}>Effet Suspensif</Text>
              <Text style={[styles.switchDesc, { color: colors.textSub }]}>
                Suspend l'exécution forcée selon le Code de Procédure Pénale.
              </Text>
            </View>
            <Switch
              value={suspensive}
              onValueChange={setSuspensive}
              trackColor={{ false: "#767577", true: colors.appealPrimary }}
              thumbColor={Platform.OS === "ios" ? "#FFF" : suspensive ? "#FFF" : "#F4F3F4"}
            />
          </View>

          {/* BOUTON VALIDATION */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.appealPrimary }]}
            onPress={handleConfirmAppeal}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="document-attach" size={22} color="#FFF" />
                <Text style={styles.submitBtnText}>ENREGISTRER L'ACTE D'APPEL</Text>
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
  container: { padding: 16 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 25,
  },
  headerTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  headerSub: { fontSize: 13, marginTop: 4, fontWeight: "600", opacity: 0.9 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  radioGroup: { flexDirection: "row", flexWrap: 'wrap', gap: 10 },
  radioBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    minWidth: '30%'
  },
  radioText: { fontWeight: "800", fontSize: 12 },
  helperText: { fontSize: 12, fontStyle: "italic", marginTop: 10, marginBottom: 25, fontWeight: "600" },
  textArea: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    minHeight: 160,
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 35,
    borderWidth: 1.5
  },
  switchTitle: { fontWeight: "900", fontSize: 15 },
  switchDesc: { fontSize: 12, marginTop: 4, marginRight: 20, lineHeight: 18, fontWeight: "500" },
  submitBtn: {
    flexDirection: "row",
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" }
    })
  },
  submitBtnText: { color: "#FFF", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});