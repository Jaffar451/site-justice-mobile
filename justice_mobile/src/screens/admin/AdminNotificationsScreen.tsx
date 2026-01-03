import React, { useMemo, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  StatusBar, 
  Platform,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ✅ Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider"; // Hook dynamique
import api from "../../services/api"; 
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// --- TYPES ---
interface NotificationItem {
  id: number;
  title: string;
  message?: string;
  body?: string;
  type?: string;
  read: boolean;
  priority?: string;
  createdAt: string;
}

// --- SERVICES ---
const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.data || response.data || [];
};

const markNotificationRead = async (id: number) => {
  await api.patch(`/notifications/${id}/read`);
};

const deleteNotificationById = async (id: number) => {
  await api.delete(`/notifications/${id}`);
};

const clearAllNotifications = async () => {
  await api.delete('/notifications/all');
};

export default function AdminNotificationsScreen() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    modalBg: isDark ? "#1E293B" : "#FFFFFF",
    iconBg: isDark ? "#334155" : "#F1F5F9",
  };

  // 1. DATA
  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, 
  });

  const list: NotificationItem[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    return (rawData as any).data || [];
  }, [rawData]);

  // 2. MUTATIONS
  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteOneMutation = useMutation({
    mutationFn: deleteNotificationById,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setSelectedNotif(null);
    },
    onError: () => Alert.alert("Erreur", "Action impossible.")
  });

  const clearMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], { data: [] });
      Alert.alert("Succès", "Historique vidé.");
    }
  });

  const unreadCount = useMemo(() => list.filter(n => !n.read).length, [list]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "RÉCENT";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " • " + date.toLocaleDateString();
  };

  const handleClearAll = () => {
    const msg = "Voulez-vous supprimer tout l'historique des alertes ?";
    if (Platform.OS === 'web') {
        if (window.confirm(msg)) clearMutation.mutate();
    } else {
        Alert.alert("Nettoyage", msg, [
          { text: "Annuler", style: "cancel" }, 
          { text: "Tout effacer", style: "destructive", onPress: () => clearMutation.mutate() }
        ]);
    }
  };

  const handleItemPress = (item: NotificationItem) => {
    setSelectedNotif(item);
    if (!item.read) readMutation.mutate(item.id);
  };

  const handleDeleteSpecific = () => {
    if (!selectedNotif) return;
    const msg = "Supprimer définitivement cette alerte ?";
    if (Platform.OS === 'web') {
        if (window.confirm(msg)) deleteOneMutation.mutate(selectedNotif.id);
    } else {
        Alert.alert("Confirmation", msg, [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: () => deleteOneMutation.mutate(selectedNotif.id) }
        ]);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Centre d'Alertes" showBack={true} />
      
      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        
        {/* HEADER STATS */}
        {!isLoading && list.length > 0 && (
          <View style={styles.listHeader}>
            <View style={styles.unreadBadge}>
               <Text style={[styles.headerLabel, { color: isDark ? "#4ADE80" : "#059669" }]}>
                 {unreadCount} NON LUES
               </Text>
            </View>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Ionicons name="trash-bin-outline" size={16} color={primaryColor} style={{ marginRight: 5 }} />
              <Text style={[styles.clearText, { color: primaryColor }]}>TOUT EFFACER</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={primaryColor} /></View>
        ) : (
            <FlatList
                data={list}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />
                }
                renderItem={({ item }) => {
                    const isUnread = !item.read;
                    const isAlert = item.type === "alert" || item.priority === "high";
                    const accentColor = isAlert ? "#EF4444" : "#6366F1"; 

                    return (
                    <TouchableOpacity 
                        style={[styles.card, { 
                          backgroundColor: colors.bgCard, 
                          borderColor: isUnread ? accentColor : colors.border,
                          borderLeftColor: isUnread ? accentColor : colors.border 
                        }]}
                        activeOpacity={0.7}
                        onPress={() => handleItemPress(item)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: isUnread ? accentColor + "20" : colors.iconBg }]}>
                            <Ionicons 
                              name={isAlert ? "shield-half-outline" : "notifications-outline"} 
                              size={20} 
                              color={isUnread ? accentColor : colors.textSub} 
                            />
                        </View>
                        <View style={styles.itemMainContent}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.title, { color: colors.textMain, fontWeight: isUnread ? "900" : "700" }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {isUnread && <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />}
                            </View>
                            <Text style={[styles.message, { color: colors.textSub }]} numberOfLines={2}>{item.message || item.body}</Text>
                            <Text style={[styles.date, { color: colors.textSub }]}>{formatDate(item.createdAt)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSub} />
                    </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={80} color={colors.border} />
                        <Text style={[styles.emptyTitle, { color: colors.textSub }]}>Aucune notification</Text>
                    </View>
                }
            />
        )}
      </View>

      {/* ✅ MODALE DE DÉTAIL DYNAMIQUE */}
      <Modal visible={selectedNotif !== null} transparent animationType="fade" onRequestClose={() => setSelectedNotif(null)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.textSub }]}>DÉTAIL DE L'ALERTE</Text>
                    <TouchableOpacity onPress={() => setSelectedNotif(null)} style={styles.closeIcon}>
                        <Ionicons name="close-circle-outline" size={28} color={colors.textSub} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.modalSubject, { color: colors.textMain }]}>{selectedNotif?.title}</Text>
                    <View style={styles.modalMetaRow}>
                       <Ionicons name="time-outline" size={14} color={colors.textSub} />
                       <Text style={[styles.modalDate, { color: colors.textSub }]}>{formatDate(selectedNotif?.createdAt)}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.modalMessage, { color: isDark ? "#CBD5E1" : "#334155" }]}>
                      {selectedNotif?.message || selectedNotif?.body}
                    </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: isDark ? "#450A0A" : "#FEE2E2", marginRight: 12 }]} 
                        onPress={handleDeleteSpecific}
                    >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                        <Text style={[styles.actionText, { color: '#EF4444' }]}>SUPPRIMER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: primaryColor, flex: 1 }]} 
                        onPress={() => setSelectedNotif(null)}
                    >
                        <Text style={[styles.actionText, { color: '#FFF' }]}>FERMER</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  unreadBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  headerLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  clearText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  listContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 140 },
  
  card: {
    flexDirection: "row", padding: 18, borderRadius: 24, marginBottom: 12, alignItems: "center",
    borderWidth: 1.5, borderLeftWidth: 8,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  itemMainContent: { flex: 1, marginLeft: 15, marginRight: 8 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 15, letterSpacing: -0.3 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  date: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 140 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 32, padding: 25, maxHeight: '85%', elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  closeIcon: { padding: 5 },
  modalBody: { marginBottom: 25 },
  modalSubject: { fontSize: 22, fontWeight: '900', marginBottom: 10, lineHeight: 28 },
  modalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
  modalDate: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, marginVertical: 20, opacity: 0.3 },
  modalMessage: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
  
  modalActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  actionText: { fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});