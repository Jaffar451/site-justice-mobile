// PATH: src/screens/police/PoliceArrestWarrantScreen.tsx
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

// ✅ Architecture & UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAuthStore } from "../../stores/useAuthStore";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ Services
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
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();

  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  /**
   * 📥 RÉCUPÉRATION DES MANDATS (Synchronisation CID)
   */
  const fetchWarrants = async () => {
    try {
      const data = await getActiveWarrants();
      setWarrants(data || []); 
    } catch (error) {
      console.error("Erreur chargement mandats:", error);
      // Fallback Mock pour le développement
      const mockData: Warrant[] = [
        { id: 1, caseId: 101, personName: "Seydou Kone", reason: "Vol aggravé et fuite", urgency: "high", createdAt: new Date().toISOString() },
        { id: 2, caseId: 105, personName: "Ibrahim Maiga", reason: "Atteinte à la sûreté de l'État", urgency: "critical", createdAt: new Date().toISOString() }
      ];
      setWarrants(mockData);
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
   * ⚖️ EXÉCUTION DU MANDAT & OUVERTURE G.A.V
   */
  const handleExecuteWarrant = (item: Warrant) => {
    Alert.alert(
      "⚖️ Exécution de Mandat",
      `Confirmez-vous l'appréhension de ${item.personName.toUpperCase()} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer l'arrestation", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // 1. Simuler l'appel API (Dans le futur : executeWarrant(item.id))
              setTimeout(() => {
                setWarrants((prev) => prev.filter((w) => w.id !== item.id));
                setLoading(false);

                // 2. Proposition d'ouverture de Garde à Vue immédiate
                Alert.alert(
                  "Individu Appréhendé ✅",
                  "L'arrestation a été enregistrée. Voulez-vous ouvrir le registre de Garde à Vue pour ce suspect ?",
                  [
                    { text: "Plus tard", style: "default" },
                    { 
                      text: "Ouvrir G.A.V", 
                      style: "default",
                      onPress: () => navigation.navigate("PoliceCustody", { 
                        complaintId: item.caseId, 
                        suspectName: item.personName 
                      }) 
                    }
                  ]
                );
              }, 1000);
            } catch (error) {
              Alert.alert("Erreur", "Le serveur central est injoignable.");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case "critical": return { color: "#EF4444", label: "RECHERCHÉ / DANGER", icon: "alert-circle" };
      case "high": return { color: "#F59E0B", label: "PRIORITÉ HAUTE", icon: "warning" };
      default: return { color: "#10B981", label: "PROCÉDURE NORMALE", icon: "document-text" };
    }
  };

  const renderWarrantItem = ({ item }: { item: Warrant }) => {
    const config = getUrgencyConfig(item.urgency);

    return (
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.bgCard, 
          borderColor: colors.border,
          borderLeftColor: config.color
        }
      ]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: config.color + "15" }]}>
            <Ionicons name={config.icon as any} size={12} color={config.color} />
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSub }]}>
            Émis le {new Date(item.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>

        <Text style={[styles.personName, { color: colors.textMain }]}>
          {item.personName.toUpperCase()}
        </Text>
        
        <View style={[styles.reasonBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
            <Text style={[styles.reason, { color: colors.textSub }]}>
                <Text style={{fontWeight: '900', color: colors.textMain}}>MOTIF : </Text>{item.reason}
            </Text>
        </View>
        
        <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
          <View style={styles.caseIdContainer}>
              <Ionicons name="folder-open" size={16} color={primaryColor} />
              <Text style={[styles.caseIdText, { color: primaryColor }]}>RG #{item.caseId}</Text>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.actionBtn, { backgroundColor: primaryColor }]}
            onPress={() => handleExecuteWarrant(item)}
          >
            <Text style={styles.actionBtnText}>ARRÊTER</Text>
            <Ionicons name="hand-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Mandats d'Arrêt" showBack={true} />
      
      {loading && !refreshing ? (
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.syncText, { color: colors.textSub }]}>Synchronisation CID Niger...</Text>
        </View>
      ) : (
        <FlatList
          data={warrants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWarrantItem}
          contentContainerStyle={[styles.listContent, { backgroundColor: colors.bgMain }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchWarrants} tintColor={primaryColor} />
          }
          ListHeaderComponent={
            warrants.length > 0 ? (
              <View style={styles.listHeader}>
                  <Ionicons name="shield-half" size={18} color={colors.textSub} />
                  <Text style={[styles.listHeaderText, { color: colors.textSub }]}>
                    {warrants.length} MANDAT(S) ACTIF(S)
                  </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#064E3B" : "#F0FDF4" }]}>
                <Ionicons name="shield-checkmark" size={70} color="#10B981" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Aucun Mandat en Attente</Text>
              <Text style={[styles.emptyText, { color: colors.textSub }]}>
                Tous les mandats d'arrêt ont été exécutés ou levés par le Parquet.
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
  syncText: { marginTop: 15, fontWeight: '700', fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 140, flexGrow: 1 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingHorizontal: 4 },
  listHeaderText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },

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
  dateText: { fontSize: 11, fontWeight: '700', opacity: 0.8 },
  personName: { fontSize: 22, fontWeight: "900", marginBottom: 12, letterSpacing: -0.5 },
  reasonBox: { padding: 14, borderRadius: 14, marginBottom: 20 },
  reason: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 16 },
  caseIdContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  caseIdText: { fontWeight: '900', fontSize: 13 },
  actionBtn: { paddingHorizontal: 16, height: 46, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2 },
  actionBtnText: { color: "#fff", fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },

  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 50 },
  emptyIconCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  emptyText: { textAlign: "center", marginTop: 10, fontSize: 14, lineHeight: 22, fontWeight: '500', opacity: 0.7 }
});