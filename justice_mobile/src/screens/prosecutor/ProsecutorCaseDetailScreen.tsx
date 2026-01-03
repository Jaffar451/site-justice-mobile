import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// ✅ Logic & Architecture
import { useAppTheme } from '../../theme/AppThemeProvider';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

export default function ProsecutorCaseDetail() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  // Récupération sécurisée du paramètre ID
  const params = route.params as { caseId: number };
  const id = params?.caseId;

  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    justicePrimary: "#7C2D12", // Bordeaux Justice Institutionnel
    pdfBg: isDark ? "#450A0A" : "#FEE2E2",
  };

  // Simulation des données reçues de l'OPJ (Format Niger)
  const caseData = {
    rg: id || "2026-NP-042",
    unite: "Commissariat Central de Niamey",
    opj: "Capitaine Idrissa Abdou",
    type: "Vol aggravé avec violence en réunion",
    suspect: "Adamou B. & Alassane S.",
    statutGAV: "En cours (36h / 48h)",
    reçuLe: "02/01/2026 à 09:15",
    resume: "Les suspects ont été interpellés suite à une effraction au quartier Plateau. Les témoins confirment l'usage d'une arme blanche. Les objets volés et l'arme ont été placés sous scellés (N°SC-2026-001).",
  };

  const handleDecision = (type: 'instruction' | 'complement' | 'classement') => {
    let title = "";
    let msg = "";

    if (type === 'instruction') {
      title = "Ouverture d'Information";
      msg = "Déférer les suspects et saisir un Juge d'Instruction ?";
    } else if (type === 'complement') {
      title = "Complément d'Enquête";
      msg = "Renvoyer le dossier à l'OPJ pour actes supplémentaires ?";
    } else {
      title = "Classement sans suite";
      msg = "Classer cette procédure définitivement au registre ?";
    }

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) executeDecision(type);
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Confirmer", onPress: () => executeDecision(type), style: type === 'classement' ? 'destructive' : 'default' }
        ]);
    }
  };

  const executeDecision = (type: string) => {
    setLoading(true);
    // Simulation e-Justice : Écriture dans le registre national
    setTimeout(() => {
      setLoading(false);
      if (type === 'instruction') {
        navigation.navigate("ProsecutorAssignJudge", { caseId: id });
      } else {
        navigation.goBack();
      }
    }, 1200);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Dossier PV #${caseData.rg}`} showBack />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 👮 SOURCE DE LA TRANSMISSION */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>ORIGINE DE LA PROCÉDURE</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.row}>
              <Ionicons name="business-outline" size={20} color={colors.justicePrimary} />
              <Text style={[styles.cardText, { color: colors.textMain }]}>{caseData.unite}</Text>
            </View>
            <View style={[styles.row, { marginTop: 12 }]}>
              <Ionicons name="person-circle-outline" size={20} color={colors.textSub} />
              <Text style={[styles.cardText, { color: colors.textMain }]}>OPJ Rapporteur : {caseData.opj}</Text>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <Ionicons name="time-outline" size={18} color={colors.textSub} />
              <Text style={[styles.dateMeta, { color: colors.textSub }]}>Transmis le {caseData.reçuLe}</Text>
            </View>
          </View>
        </View>

        {/* 👤 SUSPECT & INFRACTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>INDIVIDU(S) MIS EN CAUSE</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.suspectName, { color: colors.textMain }]}>{caseData.suspect}</Text>
            <Text style={[styles.infractionText, { color: colors.justicePrimary }]}>{caseData.type.toUpperCase()}</Text>
            
            <View style={[styles.gavBadge, { backgroundColor: isDark ? "#422006" : "#FFFBEB", borderColor: isDark ? "#F59E0B50" : "#FBBF24" }]}>
               <Ionicons name="hourglass-outline" size={16} color="#F59E0B" />
               <Text style={[styles.gavText, { color: isDark ? "#FBBF24" : "#B45309" }]}>Délai GAV : {caseData.statutGAV}</Text>
            </View>
          </View>
        </View>

        {/* 📄 RÉSUMÉ DES FAITS */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>SYNTHÈSE DES INVESTIGATIONS</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.facts, { color: isDark ? "#CBD5E1" : "#475569" }]}>{caseData.resume}</Text>
            
            <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.pdfBtn, { backgroundColor: colors.pdfBg }]}
            >
              <Ionicons name="document-text-outline" size={22} color="#EF4444" />
              <Text style={styles.pdfBtnText}>Consulter le PV d'audition scellé</Text>
              <Ionicons name="lock-closed" size={14} color="#EF4444" style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ⚖️ ORIENTATION JUDICIAIRE (DÉCISION) */}
        <Text style={[styles.sectionLabel, { color: colors.textSub }]}>DÉCISION DU MINISTÈRE PUBLIC</Text>
        
        <View style={styles.actionGrid}>
          <DecisionBtn 
            label="Ouverture d'Information" 
            subLabel="Saisir le Cabinet d'Instruction"
            icon="hammer-outline" 
            color={colors.justicePrimary} 
            colors={colors}
            onPress={() => handleDecision('instruction')} 
          />
          <DecisionBtn 
            label="Enquête Complémentaire" 
            subLabel="Retourner le PV à l'enquêteur"
            icon="return-up-back-outline" 
            color="#F59E0B" 
            colors={colors}
            onPress={() => handleDecision('complement')} 
          />
          <DecisionBtn 
            label="Classement sans suite" 
            subLabel="Extinction de l'action publique"
            icon="archive-outline" 
            color="#EF4444" 
            colors={colors}
            onPress={() => handleDecision('classement')} 
          />
        </View>

        {loading && <ActivityIndicator size="large" color={colors.justicePrimary} style={{ marginTop: 25 }} />}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const DecisionBtn = ({ label, subLabel, icon, color, onPress, colors }: any) => (
  <TouchableOpacity 
    activeOpacity={0.8}
    style={[styles.decisionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]} 
    onPress={onPress}
  >
    <View style={[styles.decisionIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.decisionLabel, { color: colors.textMain }]}>{label}</Text>
        <Text style={[styles.decisionSub, { color: colors.textSub }]}>{subLabel}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 140 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' },
  card: { padding: 20, borderRadius: 28, borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { fontSize: 14, fontWeight: '700' },
  dateMeta: { fontSize: 12, fontWeight: '600' },
  suspectName: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  infractionText: { fontSize: 13, fontWeight: '800', marginTop: 6, letterSpacing: 0.5 },
  gavBadge: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginTop: 18, gap: 8, borderWidth: 1 },
  gavText: { fontSize: 12, fontWeight: '800' },
  facts: { fontSize: 14, lineHeight: 24, fontStyle: 'italic', fontWeight: '500' },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 22, padding: 18, borderRadius: 18, gap: 12 },
  pdfBtnText: { color: '#EF4444', fontWeight: '900', fontSize: 13 },
  
  actionGrid: { gap: 12 },
  decisionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1.5 },
  decisionIcon: { width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  decisionLabel: { fontSize: 15, fontWeight: '900' },
  decisionSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});