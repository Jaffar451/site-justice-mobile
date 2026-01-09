// PATH: src/screens/prosecutor/ProsecutorCaseDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// ✅ Architecture
import { useAppTheme } from '../../theme/AppThemeProvider';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// ✅ Import API
import api from '../../services/api'; 

export default function ProsecutorCaseDetailScreen() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  // 🛡️ Récupération ID
  const params = route.params as { caseId: number };
  const id = params?.caseId;

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);

  // 🎨 Palette
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    justicePrimary: "#7C2D12",
    pdfBg: isDark ? "#450A0A" : "#FEE2E2",
  };

  // 📡 CHARGEMENT DES DONNÉES RÉELLES (BACKEND ONLY)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!id) {
        Alert.alert("Erreur", "Identifiant du dossier manquant.");
        navigation.goBack();
        return;
      }

      try {
        console.log(`[API] Récupération du dossier #${id}...`);
        const response = await api.get(`/complaints/${id}`);
        
        if (isMounted && response.data) {
          const apiData = response.data;

          // Mapping des données backend vers l'interface UI
          setCaseData({
            id: apiData.id,
            rg: apiData.trackingCode || `ND-${apiData.id}`,
            unite: apiData.originStation?.name || "Unité inconnue",
            // Gestion sécurisée si l'officier n'est pas renseigné
            opj: apiData.assignedOfficer 
                 ? `${apiData.assignedOfficer.firstname} ${apiData.assignedOfficer.lastname}` 
                 : "Non assigné",
            type: apiData.title || "Qualification non définie",
            suspect: apiData.defendantName || "Inconnu / X", // Assurez-vous que ce champ existe ou adaptez-le
            statutGAV: apiData.custodyStatus || "Non spécifié",
            reçuLe: apiData.createdAt 
                    ? new Date(apiData.createdAt).toLocaleDateString("fr-FR") + " à " + new Date(apiData.createdAt).toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'})
                    : "--/--",
            resume: apiData.description || "Aucune description disponible.",
          });
        }
      } catch (error: any) {
        console.error("Erreur chargement dossier:", error);
        
        if (isMounted) {
          const status = error.response?.status;
          const msg = status === 404 
            ? "Ce dossier est introuvable ou a été supprimé." 
            : "Impossible de récupérer les données du serveur.";
            
          Alert.alert("Erreur de chargement", msg, [
            { text: "Retour", onPress: () => navigation.goBack() }
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [id]);

  const handleDecision = (type: 'instruction' | 'complement' | 'classement') => {
    const titles = {
        instruction: "Ouverture d'Information",
        complement: "Complément d'Enquête",
        classement: "Classement sans suite"
    };
    const msgs = {
        instruction: "Saisir un Juge d'Instruction et déférer les suspects ?",
        complement: "Retourner le dossier à l'OPJ pour actes supplémentaires ?",
        classement: "Confirmer l'extinction de l'action publique ?"
    };

    Alert.alert(titles[type], msgs[type], [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: () => executeDecision(type), 
          style: type === 'classement' ? 'destructive' : 'default' 
        }
    ]);
  };

  const executeDecision = async (type: string) => {
    setLoading(true);
    try {
        // TODO: Appeler l'API réelle pour enregistrer la décision ici
        // await api.post(`/complaints/${id}/decision`, { decision: type });
        
        setTimeout(() => {
            setLoading(false);
            if (type === 'instruction') {
                navigation.navigate("ProsecutorAssignJudge", { caseId: id });
            } else {
                Alert.alert("Succès", "Décision enregistrée.");
                navigation.goBack();
            }
        }, 1000);
    } catch (error) {
        setLoading(false);
        Alert.alert("Erreur", "Échec de l'enregistrement de la décision.");
    }
  };

  if (loading) {
      return (
          <ScreenContainer withPadding={false}>
              <AppHeader title="Chargement..." showBack />
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator size="large" color={colors.justicePrimary} />
                  <Text style={{marginTop: 10, color: colors.textSub}}>Synchronisation sécurisée...</Text>
              </View>
          </ScreenContainer>
      );
  }

  // Sécurité si le rendu se fait alors que caseData est null (rare grâce au return du useEffect)
  if (!caseData) return null;

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Affaire RG #${caseData.rg}`} showBack />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 🏛️ BANDEAU D'ORIGINE */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>TRANSMISSION PJ</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.row}>
              <Ionicons name="shield-checkmark" size={20} color={colors.justicePrimary} />
              <Text style={[styles.cardText, { color: colors.textMain }]}>{caseData.unite}</Text>
            </View>
            <View style={[styles.row, { marginTop: 12 }]}>
              <Ionicons name="person-outline" size={20} color={colors.textSub} />
              <Text style={[styles.cardText, { color: colors.textMain }]}>OPJ : {caseData.opj}</Text>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSub} />
              <Text style={[styles.dateMeta, { color: colors.textSub }]}>Transmis le {caseData.reçuLe}</Text>
            </View>
          </View>
        </View>

        {/* 👤 FICHE SYNTHÉTIQUE */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>MIS EN CAUSE & INFRACTION</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.suspectName, { color: colors.textMain }]}>{caseData.suspect}</Text>
            <Text style={[styles.infractionText, { color: colors.justicePrimary }]}>{caseData.type?.toUpperCase()}</Text>
            
            <View style={[styles.gavBadge, { backgroundColor: isDark ? "#422006" : "#FFFBEB", borderColor: isDark ? "#B4530950" : "#FBBF24" }]}>
               <Ionicons name="hourglass-outline" size={16} color="#F59E0B" />
               <Text style={[styles.gavText, { color: isDark ? "#FBBF24" : "#B45309" }]}>G.A.V : {caseData.statutGAV}</Text>
            </View>
          </View>
        </View>

        {/* 📄 RÉSUMÉ DES INVESTIGATIONS */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>CONTENU DU PROCÈS-VERBAL</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.facts, { color: isDark ? "#CBD5E1" : "#475569" }]}>{caseData.resume}</Text>
            
            <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.pdfBtn, { backgroundColor: colors.pdfBg }]}
            >
              <Ionicons name="document-attach-outline" size={22} color="#EF4444" />
              <Text style={styles.pdfBtnText}>Consulter le PV complet (PDF Scellé)</Text>
              <Ionicons name="lock-closed" size={14} color="#EF4444" style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ⚖️ ACTIONS DU MAGISTRAT */}
        <Text style={[styles.sectionLabel, { color: colors.textSub, marginBottom: 15 }]}>ORIENTATION DE LA PROCÉDURE</Text>
        
        <View style={styles.actionGrid}>
          <DecisionBtn 
            label="Saisir l'Instruction" 
            subLabel="Ouverture d'Information"
            icon="hammer-outline" 
            color={colors.justicePrimary} 
            colors={colors}
            onPress={() => handleDecision('instruction')} 
          />
          <DecisionBtn 
            label="Complément d'enquête" 
            subLabel="Renvoyer à l'OPJ"
            icon="arrow-undo-outline" 
            color="#F59E0B" 
            colors={colors}
            onPress={() => handleDecision('complement')} 
          />
          <DecisionBtn 
            label="Classement sans suite" 
            subLabel="Clôturer le dossier"
            icon="archive-outline" 
            color="#EF4444" 
            colors={colors}
            onPress={() => handleDecision('classement')} 
          />
        </View>

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
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 12, textTransform: 'uppercase' },
  card: { padding: 20, borderRadius: 24, borderWidth: 1.5, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { fontSize: 14, fontWeight: '700' },
  dateMeta: { fontSize: 12, fontWeight: '600' },
  suspectName: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  infractionText: { fontSize: 13, fontWeight: '800', marginTop: 5, letterSpacing: 0.5 },
  gavBadge: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginTop: 15, gap: 8, borderWidth: 1 },
  gavText: { fontSize: 11, fontWeight: '900' },
  facts: { fontSize: 14, lineHeight: 22, fontStyle: 'italic', fontWeight: '500' },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 16, borderRadius: 16, gap: 12 },
  pdfBtnText: { color: '#EF4444', fontWeight: '900', fontSize: 13 },
  actionGrid: { gap: 12 },
  decisionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, borderWidth: 2 },
  decisionIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  decisionLabel: { fontSize: 15, fontWeight: '900' },
  decisionSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});