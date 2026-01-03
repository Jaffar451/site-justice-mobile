import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  Alert,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';

// ✅ 1. Imports Architecture
import { getAppTheme } from "../../theme";
import { LawyerScreenProps } from "../../types/navigation";
import { useAuthStore } from "../../stores/useAuthStore";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

export default function LawyerCaseDetailScreen({ route, navigation }: LawyerScreenProps<'LawyerCaseDetail'>) {
  // ✅ 2. Thème via Helper
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const { user } = useAuthStore();
  
  const { caseId } = route.params; 
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);

  /**
   * 📥 RÉCUPÉRATION DES DONNÉES DU DOSSIER
   */
  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Simulation d'appel API
      setTimeout(() => {
        setCaseData({
            rg_number: `RG-${caseId}/2025`,
            status: "En Instruction",
            room_number: "Salle 02",
            floor: "1er Étage",
            attachments: [
              { id: 1, title: "PV d'audition initiale", created_at: new Date().toISOString(), file_url: "https://example.com/pv.pdf" },
              { id: 2, title: "Rapport d'expertise", created_at: new Date().toISOString(), file_url: "https://example.com/expert.pdf" }
            ]
        });
        setLoading(false);
      }, 800);
    } catch (error) {
      setLoading(false);
      Alert.alert("Erreur", "Impossible de charger le dossier.");
    }
  };

  useEffect(() => { fetchDetails(); }, [caseId]);

  /**
   * ⚖️ DÉPÔT NUMÉRIQUE DE CONCLUSIONS (E-Barreau)
   */
  const handleUploadConclusions = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);
      
      // Simulation d'upload vers le serveur du Ministère
      setTimeout(() => {
        setUploading(false);
        Alert.alert("Succès", "Vos conclusions ont été transmises au greffe et versées au dossier numérique.");
        fetchDetails(); 
      }, 1500);

    } catch (error) {
      setUploading(false);
      Alert.alert("Échec", "Erreur lors de l'envoi du document PDF.");
    }
  };

  if (loading) return (
    <ScreenContainer withPadding={false}>
        <AppHeader title="Chargement..." showBack />
        <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: "#64748B" }]}>Accès au dossier numérique...</Text>
        </View>
    </ScreenContainer>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      
      <AppHeader 
        title={`RG #${caseData?.rg_number || caseId}`} 
        showBack={true} 
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* 🏛️ BANDEAU D'ÉTAT */}
        <View style={[styles.statusCard, { backgroundColor: "#FFF", borderColor: "#F1F5F9" }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: primaryColor + '15' }]}>
                <Text style={[styles.statusText, { color: primaryColor }]}>
                    {caseData?.status?.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.caseType}>CABINET D'INSTRUCTION</Text>
          </View>
          
          <View style={[styles.locationBox, { backgroundColor: "#FEF2F2" }]}>
            <View style={styles.iconCircle}>
                <Ionicons name="location" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.locationLabel}>LOCALISATION AU TRIBUNAL</Text>
              <Text style={styles.locationValue}>
                {caseData?.room_number || "Palais de Justice"} • {caseData?.floor || "RDC"}
              </Text>
            </View>
          </View>
        </View>

        {/* ⚡ ACTION DE LA DÉFENSE */}
        <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Actions de la Défense</Text>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.uploadBtn, { backgroundColor: primaryColor }]}
              onPress={handleUploadConclusions}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="document-attach-outline" size={22} color="white" />
                  <Text style={styles.uploadBtnText}>DÉPOSER DES CONCLUSIONS PDF</Text>
                </>
              )}
            </TouchableOpacity>
        </View>

        {/* 📂 PIÈCES DE LA PROCÉDURE */}
        <View style={styles.headerPieces}>
            <Text style={styles.sectionTitle}>Pièces au Dossier</Text>
            <View style={styles.countBadge}>
                <Text style={styles.countText}>{caseData?.attachments?.length || 0}</Text>
            </View>
        </View>
        
        {caseData?.attachments && caseData.attachments.length > 0 ? (
          caseData.attachments.map((doc: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              activeOpacity={0.7}
              style={[styles.docItem, { backgroundColor: "#FFF", borderColor: "#F1F5F9" }]}
              onPress={() => Linking.openURL(doc.file_url)}
            >
              <View style={[styles.iconBox, { backgroundColor: primaryColor + "10" }]}>
                <Ionicons name="document-text" size={22} color={primaryColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.docName} numberOfLines={1}>
                    {doc.title || "Pièce jointe"}
                </Text>
                <Text style={styles.docDate}>
                    Versé le : {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="file-tray-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
                Aucune pièce n'a encore été versée au dossier numérique.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ SmartFooter autonome */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: "600", fontSize: 13 },
  scrollContent: { padding: 16, paddingBottom: 100, backgroundColor: "#F8FAFC" },
  
  statusCard: { 
    padding: 20, borderRadius: 24, marginBottom: 25, borderWidth: 1, elevation: 4, 
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  caseType: { fontSize: 10, fontWeight: "800", color: "#64748B", letterSpacing: 0.5 },
  
  locationBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'center', elevation: 2 },
  locationLabel: { fontSize: 9, fontWeight: "900", color: "#DC2626", letterSpacing: 1, marginBottom: 2 },
  locationValue: { fontSize: 15, fontWeight: "800", color: "#1E293B" },

  actionSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5, marginBottom: 15, color: "#1E293B" },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 18, borderRadius: 20, gap: 12, elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 5 }
  },
  uploadBtnText: { color: 'white', fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },

  headerPieces: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  countBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  countText: { fontSize: 12, fontWeight: "800", color: "#64748B" },
  
  docItem: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, 
    marginBottom: 12, borderWidth: 1,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  docName: { fontWeight: "800", fontSize: 15, color: "#1E293B" },
  docDate: { fontSize: 12, marginTop: 4, fontWeight: "500", color: "#64748B" },

  emptyBox: { 
    padding: 40, alignItems: 'center', borderRadius: 24,
    borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' 
  },
  emptyText: { textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: "500", color: "#64748B", lineHeight: 20 }
});