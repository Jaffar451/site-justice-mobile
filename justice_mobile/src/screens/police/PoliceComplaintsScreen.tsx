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

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services & Types
import { getAllComplaints, updateComplaint, Complaint } from "../../services/complaint.service";

export default function PoliceComplaintsScreen({ navigation }: PoliceScreenProps<'PoliceCases'>) {
  // ✅ 2. Thème & Auth
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
    border: isDark ? "#334155" : "#F1F5F9",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      
      const sortedData = data.sort((a: Complaint, b: Complaint) => {
        const dateA = new Date(a.filedAt || (a as any).createdAt).getTime();
        const dateB = new Date(b.filedAt || (b as any).createdAt).getTime();
        return dateB - dateA;
      });
      
      setComplaints(sortedData);
    } catch (error) {
      if (Platform.OS === 'web') window.alert("Erreur de synchronisation du registre.");
      else Alert.alert("Erreur réseau", "Impossible de synchroniser le répertoire.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [])
  );

  const handleStartInvestigation = async (id: number) => {
    try {
      await updateComplaint(id, { status: "en_cours_OPJ" } as any);
      loadComplaints();
    } catch (error) {
      Alert.alert("Erreur", "La prise en charge du dossier a échoué.");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "soumise": 
        return { label: "NOUVEAU", color: "#2563EB", bg: isDark ? "#1e3a8a" : "#DBEAFE" };
      case "en_cours_OPJ": 
        return { label: "ENQUÊTE", color: "#EA580C", bg: isDark ? "#431407" : "#FFEDD5" };
      case "attente_validation": 
        return { label: "VISA", color: "#7C3AED", bg: isDark ? "#2e1065" : "#F3E8FF" };
      case "transmise_parquet": 
        return { label: "PARQUET", color: "#16A34A", bg: isDark ? "#064e3b" : "#DCFCE7" };
      default: 
        return { label: "ARCHIVE", color: colors.textSub, bg: isDark ? "#0F172A" : "#F1F5F9" };
    }
  };

  const renderItem = ({ item }: { item: Complaint }) => {
    const config = getStatusConfig(item.status);
    const dateStr = item.filedAt || (item as any).createdAt || new Date().toISOString();

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        onPress={() => navigation.navigate("PoliceComplaintDetails", { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>
            {item.title || `Dossier RG-${item.id}`}
          </Text>
          <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSub }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
          <View style={styles.dateInfo}>
             <Ionicons name="time-outline" size={14} color={colors.textSub} />
             <Text style={[styles.dateText, { color: colors.textSub }]}>
               {new Date(dateStr).toLocaleDateString("fr-FR")}
             </Text>
          </View>
          
          {item.status === "soumise" ? (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: primaryColor }]}
              onPress={() => handleStartInvestigation(item.id)}
            >
              <Text style={styles.actionBtnText}>Prendre en charge</Text>
              <Ionicons name="search" size={12} color="#FFF" />
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
      <StatusBar barStyle="light-content" />
      <AppHeader title="Répertoire des Plaintes" showMenu={true} />

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
                    <Ionicons name="file-tray-outline" size={60} color={colors.textSub} />
                </View>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucune plainte enregistrée.</Text>
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
  loadingText: { marginTop: 15, fontSize: 13, fontWeight: '700' },
  listPadding: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 140 },
  
  emptyCenter: { alignItems: "center", marginTop: 100 },
  emptyIconCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 15, fontWeight: '700' },

  card: {
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }
    }),
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 17, fontWeight: "900", flex: 1, marginRight: 10, letterSpacing: -0.5 },
  description: { fontSize: 14, marginBottom: 18, lineHeight: 22, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  
  footerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    borderTopWidth: 1.5, 
    paddingTop: 15 
  },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, fontWeight: '700' },
  
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 12, 
  },
  actionBtnText: { color: "#fff", fontSize: 11, fontWeight: "900", textTransform: 'uppercase' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 }
});