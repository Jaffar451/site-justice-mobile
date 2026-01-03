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
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { createDecision } from "../../services/decision.service";

export default function JudgeSentenceScreen({ route, navigation }: JudgeScreenProps<'CreateDecision'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  // Extraction sécurisée
  const { caseId } = route.params || { caseId: "N/A" };

  const [verdict, setVerdict] = useState<"condamnation" | "relaxe">("condamnation");
  const [sentenceLength, setSentenceLength] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [motivations, setMotivations] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    headerLine: isDark ? "#334155" : "#F1F5F9",
  };

  const handleFinalizeSentence = async () => {
    if (!motivations.trim() || motivations.trim().length < 20) {
      const msg = "Le délibéré doit être motivé en fait et en droit (min. 20 car.).";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Motivation insuffisante", msg);
      return;
    }

    if (verdict === "condamnation" && !sentenceLength.trim()) {
      Alert.alert("Précision requise", "Veuillez spécifier la peine d'emprisonnement.");
      return;
    }

    const title = "Signature du Jugement ⚖️";
    const msg = "Le prononcé est irréversible et clôture les débats. Confirmer la signature ?";

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`${title} : ${msg}`);
        if (confirm) executePublish();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer et Publier", style: verdict === "condamnation" ? "destructive" : "default", onPress: executePublish }
        ]);
    }
  };

  const executePublish = async () => {
    setLoading(true);
    try {
      const payload = {
        caseId: Number(caseId),
        verdict: verdict.toUpperCase(),
        content: motivations.trim(),
        sentenceDetails: verdict === "condamnation" ? {
          length: sentenceLength.trim(),
          fine: fineAmount.trim() || "0"
        } : null,
        signedBy: `${user?.firstname} ${user?.lastname}`,
        judgeSignature: `JUDGE-DEC-${user?.id}-${Date.now()}`,
        date: new Date().toISOString(),
      };

      await createDecision(payload as any);
      if (Platform.OS === 'web') window.alert("✅ Justice Rendue : Décision versée aux minutes.");
      navigation.popToTop();
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'enregistrement de l'acte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Prononcé de Peine" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* 🏛️ ENTÊTE DU CABINET */}
          <View style={[styles.caseHeader, { borderColor: colors.headerLine }]}>
            <Text style={[styles.caseTitle, { color: colors.textMain }]}>Minute RG #{caseId}</Text>
            <Text style={[styles.caseSubtitle, { color: colors.textSub }]}>
              Magistrat : Juge {user?.lastname?.toUpperCase()}
            </Text>
          </View>

          {/* DISPOSITIF DU JUGEMENT */}
          <Text style={[styles.label, { color: colors.textSub }]}>Dispositif du Jugement *</Text>
          <View style={styles.verdictRow}>
            {(["condamnation", "relaxe"] as const).map((type) => {
              const isSelected = verdict === type;
              const activeColor = type === "relaxe" ? "#10B981" : "#EF4444";
              
              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.85}
                  onPress={() => setVerdict(type)}
                  style={[
                    styles.verdictBtn,
                    { 
                      backgroundColor: isSelected ? activeColor : colors.bgCard,
                      borderColor: isSelected ? activeColor : colors.border 
                    },
                  ]}
                >
                  <Ionicons 
                    name={type === "relaxe" ? "shield-checkmark-outline" : "hammer-outline"} 
                    size={24} 
                    color={isSelected ? "#FFF" : colors.textSub} 
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={[styles.verdictBtnText, { color: isSelected ? "#FFF" : colors.textSub }]}>
                    {type === "relaxe" ? "RELAXE" : "CONDAMNATION"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* DÉTAILS DE LA PEINE */}
          {verdict === "condamnation" && (
            <View style={styles.sentenceForm}>
              <Text style={[styles.label, { color: colors.textSub }]}>Peine d'emprisonnement *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
                placeholder="Ex: 2 ans ferme"
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={sentenceLength}
                onChangeText={setSentenceLength}
              />

              <Text style={[styles.label, { color: colors.textSub }]}>Amende pécuniaire (FCFA)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
                placeholder="Ex: 250 000"
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                keyboardType="numeric"
                value={fineAmount}
                onChangeText={setFineAmount}
              />
            </View>
          )}

          {/* MOTIVATIONS JURIDIQUES */}
          <Text style={[styles.label, { color: colors.textSub }]}>Motivation de la Minute (Attendu que...) *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Détaillez les motifs de fait et de droit..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={motivations}
            onChangeText={setMotivations}
          />

          {/* SIGNATURE NUMÉRIQUE */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.finalBtn, 
              { backgroundColor: verdict === 'condamnation' ? '#EF4444' : primaryColor }, 
              loading && { opacity: 0.7 }
            ]}
            onPress={handleFinalizeSentence}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="ribbon-outline" size={24} color="#FFF" />
                <Text style={styles.finalBtnText}>SIGNER ET RENDRE LE JUGEMENT</Text>
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
  caseHeader: { marginBottom: 25, borderBottomWidth: 1, paddingBottom: 15 },
  caseTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  caseSubtitle: { fontSize: 13, marginTop: 4, fontWeight: "700" },
  
  label: { fontSize: 11, fontWeight: "900", marginBottom: 10, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 },
  verdictRow: { flexDirection: "row", gap: 12, marginBottom: 15 },
  verdictBtn: { flex: 1, height: 100, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 2, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 3 } }) },
  verdictBtnText: { fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
  
  sentenceForm: { marginTop: 5 },
  input: { borderRadius: 16, padding: 18, borderWidth: 1.5, fontSize: 16, fontWeight: '600' },
  textArea: { height: 250, lineHeight: 24 },
  
  finalBtn: { 
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
  finalBtnText: { color: "#FFF", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
});