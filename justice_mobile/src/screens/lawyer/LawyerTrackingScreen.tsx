import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  StatusBar,
  TouchableOpacity,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// ✅ 1. Imports Architecture Alignés
import { getAppTheme } from "../../theme";
import { useAuthStore } from "../../stores/useAuthStore";
import { LawyerScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

interface CaseTracking {
  id: number;
  rg_number: string;
  status: string;
  room_number: string | null;
  floor: string | null;
  court_name: string;
  updated_at: string;
}

export default function LawyerTrackingScreen({ navigation }: LawyerScreenProps<'LawyerTracking'>) {
  // ✅ 2. Thème & Auth (Zustand)
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cases, setCases] = useState<CaseTracking[]>([]);

  /**
   * 📥 RÉCUPÉRATION DES AFFAIRES (Mock aligné sur la logique Niger Justice)
   */
  const fetchCases = async () => {
    try {
      // Simulation pour le développement
      setTimeout(() => {
          setCases([
            { id: 1, rg_number: "452/RP/2025", status: "Audience", room_number: "02", floor: "1er", court_name: "TGI Niamey", updated_at: "23/12/2025" },
            { id: 2, rg_number: "118/RG/2024", status: "Instruction", room_number: null, floor: "2ème", court_name: "TGI Niamey", updated_at: "20/12/2025" }
          ]);
          setLoading(false);
          setRefreshing(false);
      }, 800);
    } catch (error) {
      console.error("Erreur tracking avocat:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCases();
  }, []);

  /**
   * 🎨 GESTION DES STATUTS (Code Couleur Judiciaire)
   */
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'audience': return { color: "#10B981", bg: "#DCFCE7" }; // Vert
      case 'instruction': return { color: "#3B82F6", bg: "#DBEAFE" }; // Bleu
      case 'délibéré': return { color: "#F59E0B", bg: "#FEF3C7" }; // Orange
      default: return { color: "#64748B", bg: "#F1F5F9" }; // Gris
    }
  };

  const renderItem = ({ item }: { item: CaseTracking }) => {
    const statusConfig = getStatusStyle(item.status);

    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        onPress={() => navigation.navigate("LawyerCaseDetail", { caseId: item.id })}
        style={[styles.card, { backgroundColor: "#FFF", borderColor: "#F1F5F9" }]}
      >
        {/* Header : RG & Badge Statut */}
        <View style={styles.headerRow}>
          <View style={styles.rgContainer}>
            <View style={[styles.iconBox, { backgroundColor: primaryColor + "15" }]}>
                <Ionicons name="document-text" size={18} color={primaryColor} />
            </View>
            <Text style={[styles.rgNumber, { color: "#1E293B" }]}>{item.rg_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {/* Localisation Physique au Palais */}
        <View style={styles.locationBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={20} color="#EF4444" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.locationLabel}>EMPLACEMENT DU DOSSIER</Text>
            <Text style={[styles.roomText, { color: "#1E293B" }]}>
               {item.room_number ? `Salle ${item.room_number}` : "Bureau du Greffe"} 
               {item.floor ? ` • ${item.floor} Étage` : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </View>
        
        {/* Footer : Juridiction */}
        <View style={styles.footerRow}>
          <View style={styles.courtInfo}>
            <Ionicons name="business-outline" size={14} color="#94A3B8" />
            <Text style={styles.courtName}>{item.court_name}</Text>
          </View>
          <Text style={styles.dateText}>Màj : {item.updated_at}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Suivi des Affaires" showMenu={true} />

      <View style={styles.mainContainer}>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Répertoire Actif</Text>
          <Text style={styles.subtitle}>Suivi temps-réel de l'acheminement des dossiers</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.loadingText}>Accès au registre numérique...</Text>
          </View>
        ) : (
          <FlatList
            data={cases}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyTitle}>Aucun dossier suivi</Text>
                <Text style={styles.emptySub}>
                  Vous n'êtes actuellement rattaché à aucune affaire en cours.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* ✅ SmartFooter autonome avec rôle avocat */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 16, paddingTop: 15 },
  pageHeader: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "900", color: "#1E293B", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 4, fontWeight: "600" },
  listContainer: { paddingBottom: 120 },
  
  card: { 
    padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  rgContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rgNumber: { fontWeight: "900", fontSize: 16 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  
  locationBlock: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, backgroundColor: "#F8FAFC" },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'center', elevation: 1 },
  locationLabel: { fontSize: 9, fontWeight: "900", color: "#94A3B8", letterSpacing: 1, marginBottom: 2 },
  roomText: { fontSize: 15, fontWeight: "800" },
  
  footerRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9'
  },
  courtInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  courtName: { fontSize: 12, color: "#64748B", fontWeight: "700" },
  dateText: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },

  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  loadingText: { marginTop: 15, color: "#64748B", fontWeight: "700", fontSize: 13 },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#64748B", marginTop: 15 },
  emptySub: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginTop: 8, lineHeight: 20, fontWeight: "500" }
});