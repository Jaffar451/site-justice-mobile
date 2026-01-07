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

// ✅ Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

type PVType = "AUDITION" | "CONSTAT" | "INTERPELLATION" | "PERQUISITION";

export default function PolicePVScreen({ navigation }: PoliceScreenProps<'PolicePVScreen'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [pvType, setPvType] = useState<PVType>("AUDITION");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [involvedPerson, setInvolvedPerson] = useState("");
  const [loading, setLoading] = useState(false);

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
      const msg = "L'objet et le récit des faits sont obligatoires pour sceller l'acte.";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Champs requis", msg);
      return;
    }

    setLoading(true);
    
    // Simulation d'enregistrement API & Scellement SHA-256
    setTimeout(() => {
      setLoading(false);
      const pvRef = `PV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}/DGPN`;
      
      if (Platform.OS === 'web') {
          window.alert(`✅ Acte scellé sous la référence : ${pvRef}`);
          navigation.goBack();
      } else {
          Alert.alert(
            "Acte Procédural Scellé ⚖️", 
            `Le procès-verbal a été enregistré sous le N° ${pvRef} et transmis au Parquet.`,
            [{ text: "Terminer", onPress: () => navigation.goBack() }]
          );
      }
    }, 1500);
  };

  const getTypeLabel = (type: PVType) => {
    switch (type) {
      case "AUDITION": return "Procès-Verbal d'Audition";
      case "CONSTAT": return "Procès-Verbal de Constat";
      case "INTERPELLATION": return "Procès-Verbal d'Interpellation";
      case "PERQUISITION": return "P.V de Perquisition et Saisie";
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Rédaction d'Acte" showBack />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 🏷️ SÉLECTION DU TYPE */}
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>NATURE DE L'ACTE</Text>
            <View style={{ marginBottom: 20 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                  {(["AUDITION", "CONSTAT", "INTERPELLATION", "PERQUISITION"] as PVType[]).map((type) => (
                  <TouchableOpacity
                      key={type}
                      activeOpacity={0.7}
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

            {/* 📝 FORMULAIRE */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={[styles.headerForm, { backgroundColor: primaryColor + '10', borderBottomColor: colors.border }]}>
                 <Ionicons name="document-text" size={20} color={primaryColor} />
                 <Text style={[styles.headerTitle, { color: primaryColor }]}>{getTypeLabel(pvType)}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSub }]}>OBJET DE LA PROCÉDURE *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                  placeholder="Ex: Vol de bétail, Trouble à l'ordre public..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSub }]}>PERSONNE CONCERNÉE / DÉCLARANT</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                  placeholder="Nom, Prénom, N° CNI ou Passeport..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  value={involvedPerson}
                  onChangeText={setInvolvedPerson}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSub }]}>RÉCIT DES FAITS / DÉPOSITIONS *</Text>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                  placeholder="L'an deux mille vingt-six, et le... Nous, Officier de Police Judiciaire..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  multiline
                  numberOfLines={12}
                  textAlignVertical="top"
                  value={content}
                  onChangeText={setContent}
                />
              </View>
            </View>

            {/* 🚀 VALIDATION */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.submitBtn, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                  <Text style={styles.submitText}>SCELLER ET TRANSMETTRE L'ACTE</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.legalInfo}>
                <Ionicons name="finger-print" size={18} color={colors.textSub} />
                <Text style={[styles.legalText, { color: colors.textSub }]}>
                    Authentifié par signature électronique e-Justice Niger.
                </Text>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1, textTransform: 'uppercase' },
  typeScroll: { marginBottom: 5 },
  typeChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, marginRight: 10 },
  typeText: { fontSize: 11, fontWeight: "800" },
  formCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 25 },
  headerForm: { flexDirection: "row", alignItems: "center", gap: 10, padding: 18, borderBottomWidth: 1 },
  headerTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 0.3 },
  inputGroup: { padding: 15 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: "700" },
  textArea: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 15, fontWeight: "500", minHeight: 300, lineHeight: 22 },
  submitBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    height: 64, 
    borderRadius: 20, 
    gap: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  legalInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, opacity: 0.6 },
  legalText: { fontSize: 11, fontWeight: '700', fontStyle: 'italic' }
});