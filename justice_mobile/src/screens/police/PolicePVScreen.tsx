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

// ✅ 1. Imports Architecture Alignés
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

type PVType = "AUDITION" | "CONSTAT" | "INTERPELLATION" | "PERQUISITION";

export default function PolicePVScreen({ navigation }: PoliceScreenProps<'PolicePVScreen'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [pvType, setPvType] = useState<PVType>("AUDITION");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [involvedPerson, setInvolvedPerson] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
    chipUnselected: isDark ? "#1E293B" : "#F1F5F9",
  };

  const handleSubmit = () => {
    if (!subject.trim() || !content.trim()) {
      const msg = "L'objet et le contenu du PV sont obligatoires.";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Champs requis", msg);
      return;
    }

    setLoading(true);
    
    // Simulation d'enregistrement (Signature numérique)
    setTimeout(() => {
      setLoading(false);
      const pvRef = `PV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
      
      if (Platform.OS === 'web') {
          window.alert(`✅ PV Enregistré sous la référence ${pvRef}`);
          navigation.goBack();
      } else {
          Alert.alert(
            "Acte Procédural Scellé", 
            `Le procès-verbal a été numéroté ${pvRef} et transmis pour visa hiérarchique.`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
      }
    }, 1500);
  };

  const getTypeLabel = (type: PVType) => {
    switch (type) {
      case "AUDITION": return "Audition de Témoin / Suspect";
      case "CONSTAT": return "Constat d'Infraction";
      case "INTERPELLATION": return "Fiche d'Interpellation";
      case "PERQUISITION": return "Compte-Rendu Perquisition";
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Rédaction d'Acte" showBack />

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
          {/* 🏷️ SÉLECTION DU TYPE DE PV */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>TYPE DE PROCÈS-VERBAL</Text>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {(["AUDITION", "CONSTAT", "INTERPELLATION", "PERQUISITION"] as PVType[]).map((type) => (
                <TouchableOpacity
                    key={type}
                    onPress={() => setPvType(type)}
                    style={[
                    styles.typeChip,
                    { 
                        backgroundColor: pvType === type ? primaryColor : colors.chipUnselected,
                        borderColor: pvType === type ? primaryColor : colors.border
                    }
                    ]}
                >
                    <Text style={[styles.typeText, { color: pvType === type ? "#FFF" : colors.textSub }]}>
                    {type}
                    </Text>
                </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          {/* 📝 FORMULAIRE DE RÉDACTION */}
          <View style={[styles.formCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={[styles.headerForm, { backgroundColor: primaryColor + '15', borderBottomColor: colors.border }]}>
               <Ionicons name="document-text" size={20} color={primaryColor} />
               <Text style={[styles.headerTitle, { color: primaryColor }]}>{getTypeLabel(pvType)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub }]}>OBJET DU PV *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                placeholder="Ex: Vol aggravé, Constat d'accident..."
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub }]}>PERSONNE CONCERNÉE (Identité)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                placeholder="Nom, Prénom, N° CNI..."
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={involvedPerson}
                onChangeText={setInvolvedPerson}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSub }]}>RÉCIT DES FAITS / DÉCLARATION *</Text>
              <TextInput
                style={[styles.textArea, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                placeholder="Rédigez ici le contenu solennel de l'acte..."
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
              />
            </View>
          </View>

          {/* 🚨 ACTIONS DE SCELLEMENT */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: primaryColor }, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                <Text style={styles.submitText}>SCELLER ET TRANSMETTRE</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.legalInfo}>
              <Ionicons name="finger-print" size={16} color={colors.textSub} />
              <Text style={[styles.legalText, { color: colors.textSub }]}>
                  L'inscription au registre numérique vaut signature solennelle.
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
  scrollView: { flex: 1 },
  container: { padding: 20 },
  
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 5 },
  
  typeScroll: { marginBottom: 25, maxHeight: 50 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginRight: 10 },
  typeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  formCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 25, elevation: 2 },
  headerForm: { flexDirection: "row", alignItems: "center", gap: 10, padding: 18, borderBottomWidth: 1 },
  headerTitle: { fontSize: 13, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 0.5 },

  inputGroup: { padding: 15 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 15, fontWeight: "700" },
  textArea: { borderWidth: 1.5, borderRadius: 16, padding: 18, fontSize: 15, fontWeight: "500", minHeight: 250, lineHeight: 22 },

  submitBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 20, 
    borderRadius: 20, 
    gap: 12,
    ...Platform.select({
      android: { elevation: 6 },
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' }
    })
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  
  legalInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, opacity: 0.7 },
  legalText: { fontSize: 11, fontWeight: '700', fontStyle: 'italic' }
});