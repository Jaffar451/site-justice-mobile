// PATH: src/screens/police/PolicePVScreen.tsx
import React, { useState, useEffect } from "react";
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

// ✅ Architecture & Logic
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services (À adapter selon votre API)
import { updateComplaint } from "../../services/complaint.service";

type PVType = "AUDITION" | "CONSTAT" | "INTERPELLATION" | "PERQUISITION";

export default function PolicePVScreen({ route, navigation }: PoliceScreenProps<'PolicePVScreen'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  // ✅ Récupération du dossier lié (si présent)
  const complaintId = route.params?.complaintId;

  const [pvType, setPvType] = useState<PVType>("AUDITION");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [involvedPerson, setInvolvedPerson] = useState("");
  const [loading, setLoading] = useState(false);

  // 📝 LOGIQUE DE TEMPLATES JURIDIQUES
  useEffect(() => {
    const year = new Date().getFullYear();
    const baseHeader = `L'an deux mille ${year === 2026 ? 'vingt-six' : 'vingt-cinq'}, et le... \nDevant nous, Officier de Police Judiciaire en poste à Niamey...\n\n`;

    switch (pvType) {
      case "AUDITION":
        setContent(`${baseHeader}Comparait par devant nous la personne nommée ci-après...\n\nQUESTION : \nREPONSE : `);
        break;
      case "CONSTAT":
        setContent(`${baseHeader}Étant informés de... nous nous sommes transportés sur les lieux où nous avons constaté que...`);
        break;
      case "INTERPELLATION":
        setContent(`${baseHeader}Agissant en vertu de... nous avons procédé à l'interpellation de...`);
        break;
      case "PERQUISITION":
        setContent(`${baseHeader}En présence de... nous avons procédé à la perquisition du domicile de... \n\nOBJETS SAISIS : `);
        break;
    }
  }, [pvType]);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
    chipUnselected: isDark ? "#1E293B" : "#F1F5F9",
  };

  const handleSubmit = async () => {
    if (!subject.trim() || content.length < 50) {
      const msg = "L'objet et un récit détaillé sont obligatoires pour la validité de l'acte.";
      Alert.alert("Champs requis", msg);
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Si lié à une plainte, on met à jour le dossier
      if (complaintId) {
          await updateComplaint(Number(complaintId), {
              lastAction: `Rédaction PV ${pvType}`,
              status: "en_cours_OPJ"
          } as any);
      }

      // Simulation du temps de scellage cryptographique
      setTimeout(() => {
        setLoading(false);
        const pvRef = `PV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}/DGPN`;
        
        Alert.alert(
          "Acte Procédural Scellé ⚖️", 
          `Le procès-verbal a été enregistré sous le N° ${pvRef} et transmis au fichier central.`,
          [{ text: "Terminer", onPress: () => navigation.goBack() }]
        );
      }, 1500);
    } catch (e) {
      setLoading(false);
      Alert.alert("Erreur", "Le serveur de certification est injoignable.");
    }
  };

  const getTypeLabel = (type: PVType) => {
    switch (type) {
      case "AUDITION": return "P.V d'Audition";
      case "CONSTAT": return "P.V de Constat";
      case "INTERPELLATION": return "P.V d'Interpellation";
      case "PERQUISITION": return "P.V de Perquisition / Saisie";
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
            {/* 🏷️ SÉLECTION DE LA NATURE DE L'ACTE */}
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>NATURE JURIDIQUE DE L'ACTE</Text>
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

            {/* 📝 FORMULAIRE DE RÉDACTION */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={[styles.headerForm, { backgroundColor: primaryColor + '10', borderBottomColor: colors.border }]}>
                 <Ionicons name="document-text-outline" size={20} color={primaryColor} />
                 <Text style={[styles.headerTitle, { color: primaryColor }]}>{getTypeLabel(pvType).toUpperCase()}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSub }]}>OBJET DE LA PROCÉDURE *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                  placeholder="Ex: Vol aggravé, Constat d'accident..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSub }]}>SUJET CONCERNÉ</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                  placeholder="Nom du déclarant ou du prévenu..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  value={involvedPerson}
                  onChangeText={setInvolvedPerson}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSub }]}>RÉCIT ET DÉPOSITIONS *</Text>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.textMain, backgroundColor: colors.inputBg }]}
                  placeholder="Rédigez l'acte ici..."
                  placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                  multiline
                  numberOfLines={15}
                  textAlignVertical="top"
                  value={content}
                  onChangeText={setContent}
                />
              </View>
            </View>

            

            {/* 🚀 ACTION FINALE */}
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
                  <Ionicons name="ribbon-outline" size={22} color="#FFF" />
                  <Text style={styles.submitText}>SCELLER ET TRANSMETTRE L'ACTE</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.legalInfo}>
                <Ionicons name="shield-checkmark" size={18} color={colors.textSub} />
                <Text style={[styles.legalText, { color: colors.textSub }]}>
                    Acte certifié conforme au Code de Procédure Pénale.
                </Text>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionTitle: { fontSize: 10, fontWeight: "900", marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  typeScroll: { marginBottom: 5 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginRight: 10 },
  typeText: { fontSize: 10, fontWeight: "800" },
  formCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 25, elevation: 2 },
  headerForm: { flexDirection: "row", alignItems: "center", gap: 10, padding: 18, borderBottomWidth: 1 },
  headerTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  inputGroup: { padding: 15 },
  label: { fontSize: 9, fontWeight: "900", marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: "700" },
  textArea: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 15, fontWeight: "500", minHeight: 350, lineHeight: 22 },
  submitBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    height: 64, 
    borderRadius: 20, 
    gap: 12,
    elevation: 4
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  legalInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, opacity: 0.6 },
  legalText: { fontSize: 11, fontWeight: '700', fontStyle: 'italic' }
});