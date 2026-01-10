// PATH: src/screens/police/PoliceComplaintsScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services & Types
import { getAllComplaints, updateComplaint, Complaint } from "../../services/complaint.service";

export default function PoliceComplaintsScreen({ navigation }: PoliceScreenProps<'PoliceComplaints'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

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
   * 📥 CHARGEMENT DU REGISTRE GLOBAL
   */
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      
      // ✅ Tri chronologique (Les plus récents en premier)
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.filedAt).getTime();
        const dateB = new Date(b.createdAt || b.filedAt).getTime();
        return dateB - dateA;
      });
      
      setComplaints(sortedData);
    } catch (error) {
      console.error("LoadComplaints Error:", error);
      if (Platform.OS === 'web') {
        window.alert("Erreur de synchronisation du registre national.");
      } else {
        Alert.alert("Erreur CID", "Impossible d'accéder au registre central de la Police.");
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [])
  );

  /**
   * 👮 AUTO-ASSIGNATION D'UN DOSSIER (OPJ Prend la main)
   */
  const handleStartInvestigation = async (id: number) => {
    try {
      // ✅ Mise à jour du statut vers 'Enquête OPJ'
      await updateComplaint(id, { 
        status: "en_cours_OPJ" 
      } as any);
      
      if (Platform.OS === 'web') {
        window.alert("Dossier pris en charge avec succès.");
      } else {
        Alert.alert("Dossier Assigné ✅", "Vous avez pris en charge ce dossier. Il est maintenant dans votre registre personnel.");
      }
      
      // Redirection vers les détails pour commencer à travailler
      navigation.navigate("PoliceComplaintDetails", { complaintId: id });
    } catch (error) {
      Alert.alert("Échec", "La prise en charge du dossier a échoué.");
    }
  };

  /**
   * 🏷️ CONFIGURATION DES BADGES (Harmonisée)
   */
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "soumise": 
        return { label: "À TRAITER", color: "#2563EB", bg: isDark ? "#1e3a8a" : "#DBEAFE" };
      case "en_cours_OPJ": 
        return { label: "ENQUÊTE", color: "#EA580C", bg: isDark ? "#431407" : "#FFEDD5" };
      case "attente_validation": 
        return { label: "VISA", color: "#7C3AED", bg: isDark ? "#2e1065" : "#F3E8FF" };
      case "transmise_parquet": 
        return { label: "PARQUET", color: "#16A34A", bg: isDark ? "#064e3b" : "#DCFCE7" };
      case "garde_a_vue":
        return { label: "G.A.V", color: "#EF4444", bg: isDark ? "#450a0a" : "#FEE2E2" };
      default: 
        return { label: "CLOS", color: colors.textSub, bg: isDark ? "#0F172A" : "#F1F5F9" };
    }
  };

  const renderItem = ({ item }: { item: Complaint }) => {
    const config = getStatusConfig(item.status);
    const dateStr = item.createdAt || item.filedAt || new Date().toISOString();
    const formattedDate = new Date(dateStr).toLocaleDateString("fr-FR");

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        onPress={() => navigation.navigate("PoliceComplaintDetails", { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>
            {item.title || `RG-#{item.id}`}
          </Text>
          <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSub }]} numberOfLines={2}>
          {item.description || "Détails non renseignés par le citoyen."}
        </Text>

        <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
          <View style={styles.dateInfo}>
             <Ionicons name="calendar-outline" size={14} color={colors.textSub} />
             <Text style={[styles.dateText, { color: colors.textSub }]}>
               Reçu le {formattedDate}
             </Text>
          </View>
          
          {item.status === "soumise" ? (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: primaryColor }]}
              onPress={() => handleStartInvestigation(item.id)}
            >
              <Text style={styles.actionBtnText}>Prendre en main</Text>
              <Ionicons name="finger-print-outline" size={14} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.detailsBtn}>
               <Text style={{ color: primaryColor, fontWeight: '800', fontSize: 12 }}>Consulter</Text>
               <Ionicons name="chevron-forward" size={16} color={primaryColor} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Répertoire e-Justice" showBack={true} />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {loading && complaints.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={[styles.loadingText, { color: colors.textSub }]}>Accès au registre sécurisé...</Text>
            </View>
        ) : (
            <FlatList
              data={complaints}
              contentContainerStyle={styles.listPadding}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={loading} 
                  onRefresh={loadComplaints} 
                  tintColor={primaryColor}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyCenter}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                    <Ionicons name="file-tray-full-outline" size={60} color={colors.border} />
                  </View>
                  <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun dossier en attente de traitement.</Text>
                </View>
              }
            />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  listPadding: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 120 },
  emptyCenter: { alignItems: "center", marginTop: 100 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 14, fontWeight: '700', opacity: 0.7 },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "900", flex: 1, marginRight: 10, letterSpacing: -0.4 },
  description: { fontSize: 13, marginBottom: 18, lineHeight: 20, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 15 },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 11, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  actionBtnText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 }
});