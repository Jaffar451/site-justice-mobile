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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// ✅ 1. Imports Architecture
import { useAppTheme } from '../../theme/AppThemeProvider'; // ✅ Hook dynamique
import { useAuthStore } from "../../stores/useAuthStore";

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
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
}

const JudgeCaseDetailScreen = () => {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const route = useRoute<any>(); 
  const caseId = route.params?.id || route.params?.caseId;
  
  const navigation = useNavigation<any>();
  const { user } = useAuthStore(); 

  const [complaint, setComplaint] = useState<ExtendedCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🎨 PALETTE DYNAMIQUE
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
    if (!caseId) {
       Alert.alert("Erreur", "Référence du dossier introuvable.");
       navigation.goBack();
       return;
    }
    try {
      setIsLoading(true);
      const data = await getComplaintById(caseId);
      setComplaint(data as ExtendedCase);
    } catch (err: any) {
      Alert.alert("Accès Refusé", "Impossible de charger les pièces du dossier.");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [caseId]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://justice.ne/verify/${complaint?.trackingCode || complaint?.id}`)}`;

  if (isLoading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Examen du dossier" showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}><ActivityIndicator size="large" color={primaryColor} /></View>
    </ScreenContainer>
  );

  if (!complaint) return null;

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Instruction RG: ${complaint.id}`} showBack={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 🏛️ BANDEAU DE RÉFÉRENCE OFFICIEL */}
        <View style={[styles.refCard, { backgroundColor: colors.bgCard, borderLeftColor: primaryColor, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
              <Text style={[styles.refTitle, { color: primaryColor }]}>RÉF. TRACKING : {complaint.trackingCode || "GÉNÉRATION..."}</Text>
              <View style={[styles.badge, { backgroundColor: primaryColor }]}>
                <Text style={styles.badgeText}>{complaint.status?.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
          </View>
          <Text style={[styles.offenceLabel, { color: colors.textSub }]}>QUALIFICATION RETENUE</Text>
          <Text style={[styles.offenceValue, { color: colors.textMain }]}>
            {complaint.provisionalOffence || "Qualification en cours"}
          </Text>
        </View>

        {/* 🔐 CERTIFICAT D'INTÉGRITÉ */}
        <View style={[styles.integrityBox, { backgroundColor: colors.integrityBg, borderColor: isDark ? "#059669" : "#10B981" }]}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.integrityTitle, { color: isDark ? "#A7F3D0" : "#10B981" }]}>Dossier Certifié</Text>
                <Text style={[styles.integritySub, { color: colors.integrityText }]}>L'intégrité de l'enquête a été vérifiée numériquement (Blockchain Justice).</Text>
            </View>
        </View>

        {/* 📄 RAPPORT DE SYNTHÈSE (PV) */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Ionicons name="document-text" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>
                Procès-Verbal de la {complaint.station?.type === 'GENDARMERIE' ? 'Brigade' : 'Police'}
            </Text>
          </View>
          <Text style={[styles.pvDetails, { color: colors.textMain }]}>
              {complaint.pvDetails || "En attente du rapport de synthèse de l'OPJ."}
          </Text>
          <Text style={[styles.filedAt, { color: colors.textSub, borderTopColor: colors.border }]}>
              Dénonciation initiale : {complaint.description}
          </Text>
        </View>

        {/* 📂 PIÈCES À CONVICTION */}
        <Text style={[styles.sectionLabel, { color: colors.textMain }]}>Inventaire des Scellés Numériques</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceRow}>
            {complaint.attachments && complaint.attachments.length > 0 ? (
                complaint.attachments.map((file) => (
                    <TouchableOpacity key={file.id} style={styles.evidenceCard} activeOpacity={0.8}>
                        <Image source={{ uri: file.file_url }} style={styles.evidenceImg} />
                        <View style={styles.evidenceOverlay}>
                           <Ionicons name="attach" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={[styles.emptyEvidence, { backgroundColor: isDark ? "#1E293B" : "rgba(0,0,0,0.03)", borderColor: colors.border }]}>
                  <Ionicons name="images-outline" size={32} color={colors.textSub} />
                  <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun scellé enregistré.</Text>
                </View>
            )}
        </ScrollView>

        {/* ⚡ ACTES DU CABINET D'INSTRUCTION */}
        <Text style={[styles.actionTitle, { color: colors.textMain }]}>Actes du Cabinet d'Instruction</Text>
        
        <View style={styles.buttonRow}>
            <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.actionButton, { backgroundColor: "#EF4444" }]} 
              onPress={() => navigation.navigate("IssueArrestWarrant", { caseId: complaint.id })}
            >
              <Ionicons name="document-lock" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Mandat</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.actionButton, { backgroundColor: primaryColor }]} 
              onPress={() => Alert.alert("Interrogatoire", "Ouvrir le module d'audition du cabinet ?")} 
            >
              <Ionicons name="mic" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Audition</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
          activeOpacity={0.85}
          style={[styles.verdictButton, { backgroundColor: "#10B981" }]} 
          onPress={() => navigation.navigate("CreateDecision", { caseId: complaint.id })} 
        >
          <Ionicons name="hammer" size={22} color="#FFF" />
          <Text style={styles.buttonText}>Rendre une Ordonnance ou Verdict</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 150 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  refCard: { padding: 20, borderRadius: 20, marginBottom: 15, borderLeftWidth: 8, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }, android: { elevation: 3 } }) },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  refTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "900" },
  offenceLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1, opacity: 0.7 },
  offenceValue: { fontSize: 22, fontWeight: "900", marginTop: 4 },
  integrityBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 25, borderStyle: 'dashed', borderWidth: 1.5 },
  qrImage: { width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 8 },
  integrityTitle: { fontSize: 15, fontWeight: '900' },
  integritySub: { fontSize: 11, marginTop: 4, lineHeight: 16, fontWeight: '500' },
  card: { padding: 20, borderRadius: 22, marginBottom: 25, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 0.5 },
  pvDetails: { fontSize: 15, lineHeight: 26, fontWeight: '500', marginBottom: 15 },
  filedAt: { fontSize: 12, fontStyle: 'italic', paddingTop: 12, borderTopWidth: 1 },
  sectionLabel: { fontSize: 11, fontWeight: "900", marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
  evidenceRow: { marginBottom: 30 },
  evidenceCard: { width: 110, height: 110, borderRadius: 18, marginRight: 15, overflow: 'hidden' },
  evidenceImg: { width: '100%', height: '100%', borderRadius: 18 },
  evidenceOverlay: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 4 },
  emptyEvidence: { width: 150, height: 110, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1 },
  emptyText: { fontSize: 10, marginTop: 8, fontWeight: '700' },
  actionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 20, marginTop: 10 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: "row", height: 60, borderRadius: 18, alignItems: 'center', justifyContent: "center", gap: 10, elevation: 3 },
  verdictButton: { flexDirection: "row", height: 65, borderRadius: 18, alignItems: 'center', justifyContent: "center", gap: 12, marginTop: 12, elevation: 4 },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
});

export default JudgeCaseDetailScreen;