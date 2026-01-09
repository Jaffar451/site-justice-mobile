import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services (Assurez-vous que ce service existe ou créez-le)
import { createDecision } from "../../services/decision.service";

const VERDICT_OPTIONS = [
  { key: "guilty", label: "COUPABLE", color: "#EF4444", icon: "hammer", desc: "Condamnation pénale" },
  { key: "not_guilty", label: "RELAXE", color: "#10B981", icon: "shield-checkmark", desc: "Acquittement des fins de poursuites" },
  { key: "dismissed", label: "NON-LIEU", color: "#64748B", icon: "close-circle", desc: "Abandon de la procédure" },
];

export default function CreateDecisionScreen({ route, navigation }: JudgeScreenProps<'CreateDecision'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary; 
  
  // Sécurisation des paramètres
  const params = route.params as { caseId: number } | undefined;
  const caseId = params?.caseId; 
  
  const [content, setContent] = useState("");
  const [verdict, setVerdict] = useState("guilty");
  const [isLoading, setIsLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
    infoCardBg: isDark ? "#0C4A6E" : "#F0F9FF",
  };

  const confirmPublish = () => {
    if (content.trim().length < 20) {
      const msg = "Le jugement doit être motivé en fait et en droit pour être valide (min. 20 caractères).";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Motivation requise", msg);
      return;
    }

    const title = "Prononcé du Verdict";
    const msg = "La publication de ce délibéré rend la décision exécutoire. Confirmer ?";

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) handlePublish();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Rendre le jugement", style: "destructive", onPress: handlePublish }
        ]);
    }
  };

  const handlePublish = async () => {
    if (!caseId) {
        Alert.alert("Erreur", "Identifiant du dossier manquant.");
        return;
    }

    setIsLoading(true);
    try {
      // Appel API réel
      await createDecision({
        caseId: Number(caseId),
        content: content.trim(),
        verdict,
        date: new Date().toISOString(),
      }); 
      
      // Feedback Succès
      if (Platform.OS === 'web') {
          window.alert("⚖️ Justice Rendue : Jugement versé au dossier.");
      } else {
          Alert.alert("⚖️ Justice Rendue", "Le jugement a été scellé et notifié aux parties.");
      }
      
      navigation.popToTop(); 
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "L'acte n'a pas pu être enregistré sur le serveur e-Justice.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si pas d'ID, on affiche une erreur (sécurité)
  if (!caseId) {
      return (
        <ScreenContainer>
            <AppHeader title="Erreur" showBack />
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color: colors.textMain}}>Erreur : Aucun dossier sélectionné.</Text>
            </View>
        </ScreenContainer>
      );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Rédaction du Délibéré" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* 🏛️ BANDEAU DU DOSSIER */}
          <View style={[styles.infoCard, { backgroundColor: colors.infoCardBg, borderColor: primaryColor }]}>
            <View style={[styles.iconBox, { backgroundColor: primaryColor }]}>
                <Ionicons name="scale" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: isDark ? "#7DD3FC" : primaryColor }]}>ACTE JURIDICTIONNEL</Text>
              <Text style={[styles.infoValue, { color: colors.textMain }]}>Minute du Dossier RG #{caseId}</Text>
            </View>
          </View>

          {/* ⚖️ CHOIX DU DISPOSITIF */}
          <Text style={[styles.label, { color: colors.textSub }]}>Dispositif de la décision</Text>
          <View style={styles.verdictGrid}>
            {VERDICT_OPTIONS.map((opt) => {
              const isActive = verdict === opt.key;
              return (
                <TouchableOpacity 
                  key={opt.key} 
                  activeOpacity={0.85}
                  style={[
                    styles.verdictCard, 
                    { 
                      backgroundColor: colors.bgCard,
                      borderColor: isActive ? opt.color : colors.border,
                      borderWidth: isActive ? 2 : 1
                    }
                  ]}
                  onPress={() => setVerdict(opt.key)}
                >
                  <View style={[styles.verdictIcon, { backgroundColor: isActive ? opt.color + "15" : (isDark ? "#0F172A" : "#F8FAFC") }]}>
                    <Ionicons name={opt.icon as any} size={22} color={isActive ? opt.color : colors.textSub} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.verdictLabel, { color: isActive ? opt.color : colors.textMain }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.verdictDesc, { color: colors.textSub }]}>{opt.desc}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={opt.color} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ✍️ MOTIVATIONS */}
          <Text style={[styles.label, { color: colors.textSub }]}>Motivations & Par ces motifs</Text>
          <TextInput
            multiline
            numberOfLines={10}
            style={[
              styles.textArea, 
              { 
                backgroundColor: colors.inputBg, 
                borderColor: colors.border,
                color: colors.textMain
              }
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Attendu que les faits sont établis... En conséquence, le tribunal statuant publiquement..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            activeOpacity={0.85}
            style={[
              styles.publishBtn, 
              { backgroundColor: primaryColor },
              isLoading && { opacity: 0.7 }
            ]} 
            onPress={confirmPublish}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#FFF" />
                <Text style={styles.btnText}>PUBLIER LE JUGEMENT</Text>
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
  scrollView: { flex: 1 },
  container: { padding: 16 },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 25, borderLeftWidth: 6, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  infoValue: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  
  label: { fontSize: 11, fontWeight: '900', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  
  verdictGrid: { gap: 10, marginBottom: 30 },
  verdictCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 12, elevation: 1 },
  verdictIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  verdictLabel: { fontWeight: '900', fontSize: 14 },
  verdictDesc: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  
  textArea: { borderRadius: 20, padding: 18, borderWidth: 1.5, minHeight: 300, fontSize: 15, lineHeight: 22, marginBottom: 30, textAlignVertical: 'top' },
  
  publishBtn: { 
    flexDirection: 'row', 
    height: 64, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    elevation: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }
    })
  },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});