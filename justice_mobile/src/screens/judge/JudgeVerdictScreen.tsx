import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
import { updateComplaint } from '../../services/complaint.service';

export default function JudgeVerdictScreen({ route, navigation }: JudgeScreenProps<'JudgeCaseDetail'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore(); 
  
  const params = route.params as any;
  const { caseId } = params || { caseId: null };

  const [verdictType, setVerdictType] = useState<'CONDAMNATION' | 'RELAXE' | 'NON_LIEU' | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  const handleSubmit = async () => {
    if (!caseId) return Alert.alert("Erreur", "Identifiant du dossier introuvable.");
    if (!verdictType) return Alert.alert("Sélection requise", "Veuillez choisir le dispositif du verdict.");
    if (comments.trim().length < 20) {
      const msg = "La minute doit être motivée en fait et en droit (min. 20 car.).";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Motivation insuffisante", msg);
      return;
    }
    
    const title = "Prononcé du Verdict ⚖️";
    const msg = "Le prononcé est irréversible et immédiatement exécutoire. Confirmez-vous la signature ?";

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`${title} : ${msg}`);
        if (confirm) executeSubmit();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer le Verdict", style: verdictType === 'CONDAMNATION' ? "destructive" : "default", onPress: executeSubmit }
        ]);
    }
  };

  const executeSubmit = async () => {
    setLoading(true);
    try {
      const finalStatus = verdictType === 'NON_LIEU' ? 'non_lieu' : 'jugée';
      
      await updateComplaint(caseId, { 
        status: finalStatus,
        verdictDetails: {
            type: verdictType,
            motivation: comments.trim(),
            signedBy: `${user?.firstname} ${user?.lastname}`,
            judgeSignature: `JUDGE-FINAL-${user?.id}-${Date.now()}`,
            date: new Date().toISOString(),
            jurisdiction: "Tribunal de Grande Instance de Niamey"
        }
      } as any);

      if (Platform.OS === 'web') window.alert("✅ Justice Rendue : Verdict scellé numériquement.");
      navigation.popToTop();
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'enregistrement sur le registre sécurisé.");
    } finally {
      setLoading(false);
    }
  };

  const getOptionColor = (type: string) => {
    if (verdictType !== type) return isDark ? "#334155" : "#F1F5F9";
    switch(type) {
        case 'CONDAMNATION': return "#EF4444"; 
        case 'RELAXE': return "#10B981";       
        case 'NON_LIEU': return "#64748B";     
        default: return primaryColor;
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Prononcé du Délibéré" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* 📂 RÉFÉRENCE DU DOSSIER */}
          <View style={[styles.headerInfo, { borderLeftColor: primaryColor }]}>
              <Text style={[styles.caseRef, { color: primaryColor }]}>DOSSIER RG #{caseId || '---'}</Text>
              <Text style={[styles.label, { color: colors.textMain }]}>Verdict du Tribunal</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>Dispositif Juridique *</Text>
          <View style={styles.optionsRow}>
            {(['CONDAMNATION', 'RELAXE', 'NON_LIEU'] as const).map((type) => {
              const isActive = verdictType === type;
              const activeColor = getOptionColor(type);
              
              let iconName: any = "archive-outline";
              if (type === 'CONDAMNATION') iconName = "hammer-outline";
              if (type === 'RELAXE') iconName = "shield-checkmark-outline";

              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.8}
                  style={[
                    styles.optionBtn,
                    { 
                      borderColor: isActive ? activeColor : colors.border,
                      backgroundColor: isActive ? activeColor : colors.bgCard,
                    }
                  ]}
                  onPress={() => setVerdictType(type)}
                >
                  <Ionicons 
                    name={iconName} 
                    size={22} 
                    color={isActive ? '#fff' : colors.textSub} 
                  />
                  <Text style={[
                      styles.optionText, 
                      { color: isActive ? '#fff' : colors.textSub }
                  ]}>
                      {type === 'NON_LIEU' ? 'NON-LIEU' : type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RÉDACTION DE LA MINUTE */}
          <Text style={[styles.sectionLabel, { color: colors.textSub, marginTop: 35 }]}>
            Motivation de la Minute (Attendu que...) *
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
            multiline
            numberOfLines={10}
            placeholder="Énoncez les motifs de fait et de droit justifiant ce dispositif..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            textAlignVertical="top"
            value={comments}
            onChangeText={setComments}
          />

          {/* SIGNATURE ÉLECTRONIQUE */}
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[
              styles.submitBtn, 
              { backgroundColor: verdictType ? getOptionColor(verdictType) : primaryColor },
              loading && { opacity: 0.7 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                  <Ionicons name="ribbon-outline" size={24} color="#fff" />
                  <Text style={styles.submitText}>SIGNER ET RENDRE LA DÉCISION</Text>
                </>
            )}
          </TouchableOpacity>

          <View style={[styles.legalNoticeBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <Ionicons name="finger-print-outline" size={18} color={colors.textSub} />
              <Text style={[styles.legalNotice, { color: colors.textSub }]}>
                Cette décision numérique est certifiée et transmise instantanément au Casier Judiciaire et aux autorités pénitentiaires du Niger.
              </Text>
          </View>
          
          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerInfo: { marginBottom: 30, borderLeftWidth: 6, paddingLeft: 18, paddingVertical: 4 },
  caseRef: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  label: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  sectionLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  optionBtn: { flex: 1, height: 95, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 }, android: { elevation: 2 } }) },
  optionText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  textArea: { borderRadius: 24, padding: 22, marginTop: 5, minHeight: 300, fontSize: 16, lineHeight: 26, fontWeight: '500', borderWidth: 1.5 },
  submitBtn: { 
    height: 64, 
    marginTop: 40, 
    borderRadius: 22, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
        android: { elevation: 6 },
        web: { boxShadow: "0px 4px 15px rgba(0,0,0,0.15)" }
    })
  },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  legalNoticeBox: { flexDirection: 'row', marginTop: 35, gap: 12, padding: 15, borderRadius: 16, alignItems: 'center' },
  legalNotice: { flex: 1, fontSize: 11, fontStyle: 'italic', lineHeight: 18, fontWeight: '600' }
});