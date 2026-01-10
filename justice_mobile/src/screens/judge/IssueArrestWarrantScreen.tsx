// PATH: src/screens/judge/IssueArrestWarrantScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Architecture & Store
import { useAppTheme } from '../../theme/AppThemeProvider';
import { JudgeScreenProps } from '../../types/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

// ✅ UI Components
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// ✅ Services
import { createArrestWarrant } from '../../services/arrestWarrant.service';

type UrgencyLevel = 'normal' | 'high' | 'critical';

export default function IssueArrestWarrantScreen({ route, navigation }: JudgeScreenProps<'IssueArrestWarrant'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  // ✅ Identité visuelle : Violet Judiciaire
  const JUDGE_ACCENT = "#7C3AED"; 

  // Sécurisation des paramètres de navigation
  const { caseId } = route.params;

  const [personName, setPersonName] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    alertBg: isDark ? "#450A0A" : "#FEF2F2",
    alertText: isDark ? "#FCA5A5" : "#EF4444",
  };

  /**
   * ✍️ VALIDATION ET SIGNATURE DU MANDAT
   */
  const submitWarrant = async () => {
    if (!personName.trim() || reason.trim().length < 15) {
      const msg = "L'identité complète et une motivation juridique (min. 15 car.) sont obligatoires.";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Acte Incomplet", msg);
      return;
    }

    const title = "SIGNATURE DU MANDAT ⚖️";
    const msg = `En signant cet acte, vous ordonnez aux forces de l'ordre l'arrestation immédiate de ${personName.toUpperCase()}. Confirmer ?`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) handleExecute();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer et Sceller", style: "destructive", onPress: handleExecute }
        ]);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      // ✅ Scellage de l'acte et envoi au fichier central (CID)
      await createArrestWarrant({
        caseId,
        personName: personName.trim(),
        reason: reason.trim(),
        urgency,
        judgeId: user?.id
      }); 
      
      if (Platform.OS === 'web') {
          window.alert("✅ Mandat signé et transmis aux unités de Police/Gendarmerie.");
      } else {
          Alert.alert("Acte Scellé ✅", "Le mandat d'arrêt est désormais exécutoire sur toute l'étendue du territoire national.");
      }
      
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erreur de Transmission", "Le serveur de la DGSN est momentanément indisponible.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Émission de Mandat" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 🏛️ BANDEAU DE SAISINE */}
          <View style={[styles.infoCard, { borderColor: JUDGE_ACCENT, backgroundColor: isDark ? "#1e1b4b" : "#F5F3FF" }]}>
            <Ionicons name="ribbon" size={26} color={JUDGE_ACCENT} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.infoTitle, { color: JUDGE_ACCENT }]}>CABINET D'INSTRUCTION N°1</Text>
                <Text style={[styles.infoSub, { color: colors.textMain }]}>Dossier de procédure : RG-#{caseId}/26</Text>
            </View>
          </View>

          {/* 👤 IDENTITÉ */}
          <Text style={[styles.label, { color: colors.textSub }]}>IDENTITÉ DU PRÉVENU *</Text>
          <TextInput 
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.textMain }]} 
            placeholder="Nom, Prénoms et Surnoms éventuels..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={personName} 
            onChangeText={setPersonName} 
          />

          {/* 📝 MOTIVATIONS */}
          <Text style={[styles.label, { color: colors.textSub }]}>MOTIFS JURIDIQUES DU MANDAT *</Text>
          <TextInput 
            style={[styles.input, styles.textArea, { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.textMain }]} 
            multiline 
            placeholder="Attendu que l'inculpé ne s'est pas présenté aux convocations... Risque de pression sur les témoins..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={reason} 
            onChangeText={setReason} 
            textAlignVertical="top"
          />

          {/* ⚡ PRIORITÉ D'INTERPELLATION */}
          <Text style={[styles.label, { color: colors.textSub }]}>DEGRÉ D'URGENCE CID</Text>
          <View style={styles.urgencyContainer}>
             {(['normal', 'high', 'critical'] as UrgencyLevel[]).map((level) => {
               const isActive = urgency === level;
               const levelColor = level === 'critical' ? '#EF4444' : level === 'high' ? '#F59E0B' : '#3B82F6';
               return (
                <TouchableOpacity
                  key={level}
                  activeOpacity={0.7}
                  onPress={() => setUrgency(level)}
                  style={[
                    styles.urgencyBtn,
                    { 
                        borderColor: levelColor, 
                        backgroundColor: isActive ? levelColor : 'transparent' 
                    }
                  ]}
                >
                  <Text style={[styles.urgencyBtnText, { color: isActive ? '#fff' : levelColor }]}>
                    {level === 'critical' ? 'DANGER' : level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
               );
             })}
          </View>

          {/* 🚀 BOUTON DE SIGNATURE */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.btn, { backgroundColor: JUDGE_ACCENT }]} 
            onPress={submitWarrant}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="finger-print" size={24} color="#fff" style={{ marginRight: 12 }} />
                <Text style={styles.btnText}>APPOSER SIGNATURE SÉCURISÉE</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.legalBox}>
            <Ionicons name="shield-checkmark" size={16} color={colors.textSub} />
            <Text style={[styles.legalDisclaimer, { color: colors.textSub }]}>
              Cet acte juridictionnel est signé par le Magistrat Instructeur. {"\n"}
              Année Judiciaire 2026 - République du Niger.
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
  scroll: { padding: 20 },
  infoCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, marginBottom: 30, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  infoTitle: { fontWeight: '900', fontSize: 11, letterSpacing: 1.5 },
  infoSub: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderWidth: 1.5, borderRadius: 18, padding: 18, marginBottom: 25, fontSize: 16, fontWeight: '700' },
  textArea: { height: 180, textAlignVertical: 'top', lineHeight: 24 },
  urgencyContainer: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  urgencyBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 2, alignItems: 'center' },
  urgencyBtnText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  btn: { 
    height: 68, 
    borderRadius: 22, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  legalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 30 },
  legalDisclaimer: { textAlign: 'center', fontSize: 11, fontStyle: 'italic', fontWeight: '600', lineHeight: 18 }
});