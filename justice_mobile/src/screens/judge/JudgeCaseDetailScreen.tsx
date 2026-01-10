// PATH: src/screens/judge/JudgeCaseDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Architecture & Store
import { useAppTheme } from '../../theme/AppThemeProvider'; 
import { useAuthStore } from "../../stores/useAuthStore";
import { JudgeScreenProps } from '../../types/navigation';

// ✅ UI Components
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// ✅ Services
import { getComplaintById } from '../../services/complaint.service';

interface ExtendedCase {
  id: number;
  status: string;
  description: string;
  provisionalOffence?: string | null;
  pvDetails?: string | null;
  trackingCode?: string;
  filedAt: string;
  attachments?: { id: number; file_url: string; filename: string }[];
  station?: { name: string; type: string };
  suspectName?: string;
}

export default function JudgeCaseDetailScreen({ route, navigation }: JudgeScreenProps<'JudgeCaseDetail'>) {
  const { theme, isDark } = useAppTheme();
  
  // ✅ Identité visuelle : Violet Judiciaire
  const JUDGE_ACCENT = "#7C3AED"; 
  
  // Récupération sécurisée du dossier
  const { caseId } = route.params;
  const { user } = useAuthStore(); 

  const [complaint, setComplaint] = useState<ExtendedCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Palette dynamique
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    integrityBg: isDark ? "#064E3B" : "#F0FDF4",
    integrityText: isDark ? "#6EE7B7" : "#166534",
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getComplaintById(caseId);
      setComplaint(data as ExtendedCase);
    } catch (err: any) {
      Alert.alert("Accès Refusé", "Le dossier est protégé ou momentanément indisponible.");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [caseId]);

  // URL QR Code de certification e-Justice Niger
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://justice.ne/verify/RP-${complaint?.id}-2026`)}`;

  if (isLoading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Examen du dossier" showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
          <ActivityIndicator size="large" color={JUDGE_ACCENT} />
          <Text style={{ marginTop: 15, color: colors.textSub, fontWeight: '700' }}>Chargement des pièces...</Text>
      </View>
    </ScreenContainer>
  );

  if (!complaint) return null;

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Dossier N° RP-${complaint.id}/26`} showBack={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 🏛️ BANDEAU DE RÉFÉRENCE ET STATUT */}
        <View style={[styles.refCard, { backgroundColor: colors.bgCard, borderLeftColor: JUDGE_ACCENT, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
              <Text style={[styles.refTitle, { color: JUDGE_ACCENT }]}>CABINET D'INSTRUCTION N°1</Text>
              <View style={[styles.badge, { backgroundColor: JUDGE_ACCENT }]}>
                <Text style={styles.badgeText}>{complaint.status?.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
          </View>
          <Text style={[styles.offenceLabel, { color: colors.textSub }]}>PRÉVENTION RETENUE :</Text>
          <Text style={[styles.offenceValue, { color: colors.textMain }]}>
            {complaint.provisionalOffence || "Qualification Judiciaire en cours"}
          </Text>
        </View>

        {/* 🔐 CERTIFICAT D'INTÉGRITÉ BLOCKCHAIN */}
        <View style={[styles.integrityBox, { backgroundColor: colors.integrityBg, borderColor: isDark ? "#059669" : "#10B981" }]}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.integrityTitle, { color: isDark ? "#A7F3D0" : "#10B981" }]}>Intégrité Certifiée</Text>
                <Text style={[styles.integritySub, { color: colors.integrityText }]}>L'historique et les preuves de ce dossier sont scellés numériquement sur le réseau e-Justice.</Text>
            </View>
        </View>

        {/* 📄 RAPPORT D'ENQUÊTE PRÉLIMINAIRE */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Ionicons name="document-text" size={20} color={JUDGE_ACCENT} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>
                Synthèse de l'Enquête de {complaint.station?.type === 'GENDARMERIE' ? 'Gendarmerie' : 'Police'}
            </Text>
          </View>
          <Text style={[styles.pvDetails, { color: colors.textMain }]}>
              {complaint.pvDetails || "Aucun rapport de synthèse n'a encore été versé au dossier par l'OPJ."}
          </Text>
          <View style={[styles.initialDescription, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
            <Text style={[styles.filedAt, { color: colors.textSub }]}>
                <Text style={{fontWeight: '900'}}>Faits dénoncés :</Text> {complaint.description}
            </Text>
          </View>
        </View>

        {/* 📂 SCELLES ET PIÈCES JOINTES */}
        <Text style={[styles.sectionLabel, { color: colors.textMain }]}>Scellés Numériques & Pièces</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceRow}>
            {complaint.attachments && complaint.attachments.length > 0 ? (
                complaint.attachments.map((file) => (
                    <TouchableOpacity key={file.id} style={styles.evidenceCard} activeOpacity={0.8}>
                        <Image source={{ uri: file.file_url }} style={styles.evidenceImg} />
                        <View style={styles.evidenceOverlay}>
                           <Ionicons name="eye" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={[styles.emptyEvidence, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <Ionicons name="images-outline" size={32} color={colors.textSub} />
                  <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun scellé iconographique.</Text>
                </View>
            )}
        </ScrollView>

        {/* ⚡ ACTES DU MAGISTRAT */}
        <Text style={[styles.actionTitle, { color: colors.textMain }]}>Décisions et Actes de Procédure</Text>
        
        <View style={styles.buttonRow}>
            <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.actionButton, { backgroundColor: "#EF4444" }]} 
              onPress={() => navigation.navigate("IssueArrestWarrant", { caseId: complaint.id })}
            >
              <Ionicons name="document-lock" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Signer Mandat</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.actionButton, { backgroundColor: JUDGE_ACCENT }]} 
              onPress={() => navigation.navigate("JudgeInterrogation" as any, { complaintId: complaint.id, suspectName: complaint.suspectName })} 
            >
              <Ionicons name="mic-outline" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Audition Juge</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
          activeOpacity={0.85}
          style={[styles.verdictButton, { backgroundColor: "#10B981" }]} 
          onPress={() => navigation.navigate("CreateDecision", { caseId: complaint.id })} 
        >
          <Ionicons name="hammer" size={22} color="#FFF" />
          <Text style={styles.buttonText}>Rendre Ordonnance ou Jugement</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 150 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  refCard: { padding: 22, borderRadius: 24, marginBottom: 20, borderLeftWidth: 10, borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  refTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  offenceLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1, opacity: 0.7 },
  offenceValue: { fontSize: 20, fontWeight: "900", marginTop: 5, letterSpacing: -0.5 },
  integrityBox: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 30, borderStyle: 'dashed', borderWidth: 1.5 },
  qrImage: { width: 65, height: 65, backgroundColor: '#FFF', borderRadius: 10 },
  integrityTitle: { fontSize: 16, fontWeight: '900' },
  integritySub: { fontSize: 11, marginTop: 4, lineHeight: 17, fontWeight: '600' },
  card: { padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottomWidth: 1 },
  cardTitle: { fontSize: 13, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 0.5 },
  pvDetails: { fontSize: 15, lineHeight: 26, fontWeight: '500', marginBottom: 20 },
  initialDescription: { padding: 15, borderRadius: 12 },
  filedAt: { fontSize: 13, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "900", marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
  evidenceRow: { marginBottom: 35 },
  evidenceCard: { width: 120, height: 120, borderRadius: 20, marginRight: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  evidenceImg: { width: '100%', height: '100%' },
  evidenceOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 6 },
  emptyEvidence: { width: 180, height: 120, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5 },
  emptyText: { fontSize: 11, marginTop: 10, fontWeight: '700' },
  actionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 20, marginTop: 10, letterSpacing: -0.5 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: "row", height: 62, borderRadius: 20, alignItems: 'center', justifyContent: "center", gap: 10, elevation: 3 },
  verdictButton: { flexDirection: "row", height: 68, borderRadius: 22, alignItems: 'center', justifyContent: "center", gap: 12, marginTop: 15, elevation: 5 },
  buttonText: { color: 'white', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
});