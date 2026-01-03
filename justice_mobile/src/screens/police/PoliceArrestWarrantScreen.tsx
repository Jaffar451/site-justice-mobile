import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// ✅ 1. Imports Architecture Alignés
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";
import { getAppTheme } from "../../theme"; // Utilisation de getAppTheme
import { useAuthStore } from "../../stores/useAuthStore"; // Utilisation de useAuthStore
import { PoliceScreenProps } from "../../types/navigation";

// ✅ Services & Types
import { getActiveWarrants } from "../../services/arrestWarrant.service";

interface Warrant {
  id: number;
  caseId: number;
  personName: string;
  reason: string;
  urgency: "normal" | "high" | "critical";
  createdAt: string;
}

export default function PoliceArrestWarrantScreen({ navigation }: PoliceScreenProps<'PoliceArrestWarrant'>) {
  // ✅ 2. Thème & Auth
  const theme = getAppTheme();
  const primaryColor = theme.color; // Bleu Roi Police
  const { user } = useAuthStore();

  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 📥 RÉCUPÉRATION DES MANDATS (Aligné sur CID Niger)
   */
  const fetchWarrants = async () => {
    try {
      // Simulation pour le développement (à remplacer par getActiveWarrants())
      const mockData: Warrant[] = [
        { id: 1, caseId: 101, personName: "Seydou Kone", reason: "Vol aggravé et fuite", urgency: "high", createdAt: new Date().toISOString() },
        { id: 2, caseId: 105, personName: "Ibrahim Maiga", reason: "Atteinte à la sûreté de l'État", urgency: "critical", createdAt: new Date().toISOString() }
      ];
      setWarrants(mockData); 
    } catch (error) {
      console.error("Erreur chargement mandats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWarrants();
    }, [])
  );

  /**
   * ⚖️ EXÉCUTION DU MANDAT (Arrestation)
   */
  const handleExecuteWarrant = (id: number, name: string) => {
    Alert.alert(
      "⚖️ Exécution de Mandat",
      `Confirmez-vous l'appréhension et le placement en G.A.V de ${name.toUpperCase()} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer l'arrestation", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Logique de mise à jour système ici
              setTimeout(() => {
                  setWarrants((prev) => prev.filter((w) => w.id !== id));
                  Alert.alert("Succès", "Mandat exécuté. L'individu est enregistré au fichier central des Gardes à Vue.");
                  setLoading(false);
              }, 1200);
            } catch (error) {
              Alert.alert("Erreur", "Le serveur du Ministère de l'Intérieur est injoignable.");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case "critical": return { color: "#DC2626", label: "RECHERCHÉ / CRITIQUE", icon: "alert-circle" };
      case "high": return { color: "#EA580C", label: "HAUTE PRIORITÉ", icon: "warning" };
      default: return { color: "#059669", label: "PROCÉDURE NORMALE", icon: "document-text" };
    }
  };

  const renderWarrantItem = ({ item }: { item: Warrant }) => {
    const config = getUrgencyConfig(item.urgency);

    return (
      <View style={[
        styles.card, 
        { 
          backgroundColor: "#FFF", 
          borderColor: "#F1F5F9",
          borderLeftColor: config.color
        }
      ]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: config.color + "15" }]}>
            <Ionicons name={config.icon as any} size={12} color={config.color} />
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={styles.dateText}>
            Émis le {new Date(item.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>

        <Text style={styles.personName}>
          {item.personName.toUpperCase()}
        </Text>
        
        <View style={styles.reasonBox}>
            <Text style={styles.reason}>
                <Text style={{fontWeight: '900', color: "#1E293B"}}>MOTIF : </Text>{item.reason}
            </Text>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.caseIdContainer}>
              <Ionicons name="folder-open" size={16} color={primaryColor} />
              <Text style={[styles.caseIdText, { color: primaryColor }]}>RG #{item.caseId}</Text>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.actionBtn, { backgroundColor: primaryColor }]}
            onPress={() => handleExecuteWarrant(item.id, item.personName)}
          >
            <Text style={styles.actionBtnText}>PROCÉDER À L'ARRÊT</Text>
            <Ionicons name="hand-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Gestion des Mandats" showBack={true} />
      
      {loading && !refreshing ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.syncText}>Synchronisation CID Niger...</Text>
        </View>
      ) : (
        <FlatList
          data={warrants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWarrantItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchWarrants} tintColor={primaryColor} />
          }
          ListHeaderComponent={
              warrants.length > 0 ? (
                  <View style={styles.listHeader}>
                      <Ionicons name="shield-half" size={18} color="#64748B" />
                      <Text style={styles.listHeaderText}>
                        {warrants.length} MANDAT(S) D'ARRÊT ACTIF(S)
                      </Text>
                  </View>
              ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="shield-checkmark" size={70} color="#10B981" />
              </View>
              <Text style={styles.emptyTitle}>Aucun Mandat en Attente</Text>
              <Text style={styles.emptyText}>
                Tous les mandats d'arrêt de votre secteur ont été exécutés ou levés.
              </Text>
            </View>
          }
        />
      )}

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  syncText: { marginTop: 15, color: "#64748B", fontWeight: '700', fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 120 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingHorizontal: 4 },
  listHeaderText: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: "#64748B" },

  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  dateText: { fontSize: 11, fontWeight: '700', opacity: 0.6, color: "#64748B" },
  personName: { fontSize: 22, fontWeight: "900", marginBottom: 12, letterSpacing: -0.5, color: "#1E293B" },
  reasonBox: { padding: 14, borderRadius: 14, marginBottom: 20, backgroundColor: "#F8FAFC" },
  reason: { fontSize: 13, lineHeight: 20, fontWeight: '500', color: "#64748B" },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1.5, borderTopColor: "#F1F5F9", paddingTop: 16 },
  caseIdContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  caseIdText: { fontWeight: '900', fontSize: 13 },
  actionBtn: { paddingHorizontal: 16, height: 46, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2 },
  actionBtnText: { color: "#fff", fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },

  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 50 },
  emptyIconCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: "#F0FDF4" },
  emptyTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5, color: "#1E293B" },
  emptyText: { textAlign: "center", marginTop: 10, fontSize: 14, lineHeight: 22, fontWeight: '500', opacity: 0.7, color: "#64748B" }
});