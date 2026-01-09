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

// ✅ 1. Imports Architecture
import { useAppTheme } from '../../theme/AppThemeProvider';
import { JudgeScreenProps } from '../../types/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
import { createArrestWarrant } from '../../services/arrestWarrant.service';

type UrgencyLevel = 'normal' | 'high' | 'critical';

export default function IssueArrestWarrantScreen({ route, navigation }: JudgeScreenProps<'IssueArrestWarrant'>) {
  // ✅ 2. Thème & Auth
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  // Sécurisation des params
  const params = route.params as { caseId: number };
  const caseId = params?.caseId;

  const [personName, setPersonName] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
    alertBg: isDark ? "#450A0A" : "#FEF2F2",
    alertText: isDark ? "#FCA5A5" : "#EF4444",
  };

  const submitWarrant = async () => {
    if (!personName.trim() || !reason.trim()) {
      const msg = "Veuillez renseigner l'identité complète et les motifs juridiques.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Données manquantes", msg);
      return;
    }

    const title = "SIGNATURE DU MANDAT";
    const msg = `Vous allez émettre un mandat d'arrêt contre ${personName}. Confirmer ?`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) handleExecute();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer l'acte", style: "destructive", onPress: handleExecute }
        ]);
    }
  };

  const handleExecute = async () => {
    if (!caseId) return Alert.alert("Erreur", "ID Dossier manquant");

    setIsLoading(true);
    try {
      await createArrestWarrant({
        caseId,
        personName: personName.trim(),
        reason: reason.trim(),
        urgency,
        judgeId: user?.id
      }); 
      
      const successMsg = "Acte Validé : Mandat signé numériquement.";
      if (Platform.OS === 'web') window.alert(`✅ ${successMsg}`);
      else Alert.alert("Acte Validé", "Le mandat d'arrêt a été signé numériquement et transmis aux forces de l'ordre.");
      
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur Système", error.message || "Échec du scellage de l'acte.");
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
          {/* 🏛️ BANDEAU D'ALERTE JURIDIQUE */}
          <View style={[styles.infoCard, { borderColor: colors.alertText, backgroundColor: colors.alertBg }]}>
            <Ionicons name="warning" size={24} color={colors.alertText} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.infoTitle, { color: colors.alertText }]}>DOSSIER RÉFÉRENCE : RG #{caseId}</Text>
                <Text style={[styles.infoSub, { color: isDark ? colors.alertText : "#64748B" }]}>Saisine du Juge du Siège</Text>
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSub }]}>IDENTITÉ DU PRÉVENU (NOM COMPLET) *</Text>
          <TextInput 
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.textMain }]} 
            placeholder="Ex: Abdourahamane Tiani..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={personName} 
            onChangeText={setPersonName} 
          />

          <Text style={[styles.label, { color: colors.textSub }]}>EXPOSÉ DES MOTIFS JURIDIQUES *</Text>
          <TextInput 
            style={[styles.input, styles.textArea, { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.textMain }]} 
            multiline 
            placeholder="Attendu que l'individu ne s'est pas présenté... Risque de fuite..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={reason} 
            onChangeText={setReason} 
            textAlignVertical="top"
          />

          {/* ⚡ NIVEAU DE PRIORITÉ D'INTERPÉLLATION */}
          <Text style={[styles.label, { color: colors.textSub }]}>PRIORITÉ D'EXÉCUTION</Text>
          <View style={styles.urgencyContainer}>
             {(['normal', 'high', 'critical'] as UrgencyLevel[]).map((level) => {
               const isActive = urgency === level;
               const levelColor = level === 'critical' ? '#EF4444' : level === 'high' ? '#F59E0B' : '#10B981';
               return (
                <TouchableOpacity
                  key={level}
                  activeOpacity={0.7}
                  onPress={() => setUrgency(level)}
                  style={[
                    styles.urgencyBtn,
                    { 
                        borderColor: levelColor, 
                        backgroundColor: isActive ? levelColor : (isDark ? colors.bgCard : 'transparent') 
                    }
                  ]}
                >
                  <Text style={[styles.urgencyBtnText, { color: isActive ? '#fff' : levelColor }]}>
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
               );
             })}
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.btn, { backgroundColor: "#EF4444" }]} 
            onPress={submitWarrant}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={22} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>APPOSER LA SIGNATURE</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.legalDisclaimer, { color: colors.textSub }]}>
            Cet acte est certifié conforme par le Juge {user?.lastname?.toUpperCase()}. {"\n"}
            Il est immédiatement exécutoire sur le territoire national.
          </Text>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  infoCard: { padding: 18, borderRadius: 16, borderWidth: 1.5, marginBottom: 25, flexDirection: 'row', alignItems: 'center' },
  infoTitle: { fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  infoSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  
  label: { fontSize: 10, fontWeight: '900', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 },
  input: { borderWidth: 1.5, borderRadius: 16, padding: 16, marginBottom: 25, fontSize: 16, fontWeight: '600' },
  textArea: { height: 140, textAlignVertical: 'top', lineHeight: 22 },
  
  urgencyContainer: { flexDirection: 'row', gap: 10, marginBottom: 35 },
  urgencyBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  urgencyBtnText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  btn: { 
    height: 64, 
    borderRadius: 20, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    elevation: 4, 
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
        web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' }
    })
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  legalDisclaimer: { textAlign: 'center', fontSize: 11, fontStyle: 'italic', marginTop: 25, lineHeight: 18 }
});