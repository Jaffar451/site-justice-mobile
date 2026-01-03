import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  Platform,
  StatusBar,
  Alert
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 1. Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Import corrigé pour le thème dynamique
import { CitizenScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services & Types
import { getMyComplaints, Complaint } from "../../services/complaint.service";

const QUEUE_KEY = '@justice_offline_queue';

interface ExtendedComplaint extends Complaint {
  trackingCode?: string;
  isOfflinePending?: boolean;
}

export default function CitizenMyComplaintsScreen({ navigation }: CitizenScreenProps<'CitizenMyComplaints'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [complaints, setComplaints] = useState<ExtendedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const bgMain = isDark ? "#0F172A" : "#F8FAFC";
  const bgCard = isDark ? "#1E293B" : "#FFFFFF";
  const textMain = isDark ? "#FFFFFF" : "#1E293B";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const borderCol = isDark ? "#334155" : "#F1F5F9";

  const hasPendingValidation = complaints.some(c => c.status === "soumise" && !c.isOfflinePending);

  const fetchComplaints = async () => {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = queueJson ? JSON.parse(queueJson) : [];
      
      const offlineComplaints: ExtendedComplaint[] = queue
        .filter((action: any) => action.service === 'complaints' && action.method === 'create')
        .map((action: any) => ({
          ...action.payload,
          id: `TEMP-${action.id}`,
          status: 'offline_pending',
          filedAt: new Date(action.timestamp).toISOString(),
          isOfflinePending: true,
          title: action.payload.title || "Plainte locale (En attente d'envoi)",
        }));

      let onlineData: ExtendedComplaint[] = [];
      try {
        const data = await getMyComplaints();
        onlineData = Array.isArray(data) ? data : [];
      } catch (err) {
        console.log("Mode déconnecté : affichage des données locales.");
      }

      const merged = [...offlineComplaints, ...onlineData].sort((a, b) => 
        new Date(b.filedAt || 0).getTime() - new Date(a.filedAt || 0).getTime()
      );

      setComplaints(merged);
    } catch (error) {
      console.error("Erreur de synchronisation", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchComplaints(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const getStatusStyle = (status: string, isOffline: boolean = false) => {
    if (isOffline) {
       return { label: "EN ATTENTE D'ENVOI", color: "#EA580C", icon: "cloud-offline", bg: isDark ? "#431407" : "#FFEDD5" };
    }

    const s = status?.toLowerCase() || "";
    switch (s) {
      case "soumise": 
        return { label: "À SIGNER AU POSTE", color: "#F59E0B", icon: "walk", bg: isDark ? "#451a03" : "#FFFBEB" };
      case "en_cours_opj": 
        return { label: "ENQUÊTE POLICE", color: "#3B82F6", icon: "shield", bg: isDark ? "#172554" : "#EFF6FF" };
      case "transmise_parquet": 
        return { label: "AU PARQUET", color: "#8B5CF6", icon: "briefcase", bg: isDark ? "#2e1065" : "#F5F3FF" };
      case "jugée": 
        return { label: "VERDICT RENDU", color: "#10B981", icon: "hammer", bg: isDark ? "#064e3b" : "#F0FDF4" };
      case "classée_sans_suite":
        return { label: "AFFIARE CLOSE", color: "#EF4444", icon: "close-circle", bg: isDark ? "#450a0a" : "#FEF2F2" };
      default: 
        return { label: "EN TRAITEMENT", color: textSub, icon: "time", bg: isDark ? "#0F172A" : "#F8FAFC" };
    }
  };

  const renderItem = ({ item }: { item: ExtendedComplaint }) => {
    const isOffline = !!item.isOfflinePending;
    const statusInfo = getStatusStyle(item.status, isOffline);
    const needsAction = item.status === "soumise" && !isOffline;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.card, 
          { 
            backgroundColor: bgCard, 
            borderLeftColor: statusInfo.color,
            borderColor: needsAction ? "#F59E0B" : borderCol,
            borderWidth: needsAction ? 1.5 : 1,
          }
        ]}
        onPress={() => isOffline 
          ? Alert.alert("Patience", "Ce dossier sera envoyé automatiquement dès le retour d'internet.")
          : navigation.navigate("ComplaintDetail", { id: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.refText, { color: textSub }]}>
            {isOffline ? "📂 EN ATTENTE" : `RÉF : #${item.trackingCode || item.id}`}
          </Text>
          <Text style={[styles.dateText, { color: textSub }]}>
            {item.filedAt ? new Date(item.filedAt).toLocaleDateString("fr-FR") : ""}
          </Text>
        </View>

        <Text style={[styles.titleText, { color: textMain }]} numberOfLines={1}>
          {item.provisionalOffence || item.title}
        </Text>
        
        <Text style={[styles.descText, { color: textSub }]} numberOfLines={2}>
          {item.description || "Détails de la plainte en cours..."}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} style={{ marginRight: 6 }} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
          
          {needsAction && (
             <View style={styles.actionPrompt}>
                <Text style={styles.actionPromptText}>SIGNATURE REQUISE</Text>
             </View>
          )}
          {!isOffline && !needsAction && <Ionicons name="chevron-forward" size={18} color={textSub} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Mes Dossiers" showBack={true} />

      <View style={[styles.container, { backgroundColor: bgMain }]}>
        {/* 📢 BANDEAU D'ALERTE */}
        {hasPendingValidation && (
          <View style={[styles.alertBar, { backgroundColor: "#F59E0B" }]}>
            <Ionicons name="walk" size={24} color="#FFF" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertTitle}>Passage au poste nécessaire</Text>
              <Text style={styles.alertSub}>Veuillez vous présenter pour signer vos dépôts numériques.</Text>
            </View>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={{ marginTop: 10, color: textSub }}>Chargement du registre...</Text>
          </View>
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={70} color={textSub} />
                <Text style={[styles.emptyTitle, { color: textMain }]}>Aucun dossier</Text>
                <Text style={[styles.emptySub, { color: textSub }]}>Vos déclarations apparaîtront ici après soumission.</Text>
              </View>
            }
          />
        )}

        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.fab, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate("CitizenCreateComplaint")}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 160 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  alertBar: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 20, alignItems: 'center', elevation: 4 },
  alertTitle: { color: '#FFF', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },
  alertSub: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },

  card: { 
    padding: 18, borderRadius: 24, marginBottom: 16, borderLeftWidth: 6,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" }
    })
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: 'center' },
  refText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  dateText: { fontSize: 11, fontWeight: "700" },
  titleText: { fontSize: 17, fontWeight: "900", marginBottom: 8 },
  descText: { fontSize: 13, marginBottom: 18, lineHeight: 20, opacity: 0.8 },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: "900" },
  
  actionPrompt: { backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  actionPromptText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "900", marginTop: 15 },
  emptySub: { fontSize: 13, marginTop: 8, textAlign: 'center' },

  fab: { 
    position: "absolute", bottom: 100, right: 20, width: 62, height: 62, borderRadius: 20, 
    justifyContent: "center", alignItems: "center", elevation: 6, zIndex: 99,
    ...Platform.select({ web: { boxShadow: "0px 4px 15px rgba(0,0,0,0.2)" } })
  }
});