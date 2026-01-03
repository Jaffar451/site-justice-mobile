import React, { useEffect, useState, useCallback } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  Platform, StatusBar, ActivityIndicator, RefreshControl 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { getAppTheme } from "../../theme";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "CASE_UPDATE" | "ALERT" | "APPOINTMENT" | "SIGNATURE";
  created_at: string;
  is_read: boolean;
  related_id?: number; 
}

// 🗺️ Mapping intelligent des redirections par rôle pour e-Justice Niger
const ROLE_SCREENS: Record<string, string> = {
  police: 'PoliceComplaintDetails',
  judge: 'JudgeCaseDetail',
  prosecutor: 'ProsecutorAssignJudge',
  clerk: 'ClerkComplaintDetails',
  lawyer: 'LawyerCaseDetail',
  citizen: 'CitizenComplaintDetail'
};

export default function NotificationsScreen({ navigation }: any) {
  // ✅ 2. Thème & Auth (Zustand)
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const { user } = useAuthStore();
  const role = user?.role || "citizen";
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Simulation appel API (A remplacer par votre service API)
      const mockNotifs: Notification[] = [
        { 
          id: 1, 
          title: "Orientation Dossier", 
          message: "Le Procureur a validé la saisine pour le dossier RG-882. Instruction ouverte.", 
          type: "CASE_UPDATE", 
          created_at: new Date().toISOString(), 
          is_read: false, 
          related_id: 882 
        },
        { 
          id: 2, 
          title: "Sécurité & Signature", 
          message: "Une nouvelle empreinte numérique a été apposée sur le PV n°102/25.", 
          type: "SIGNATURE", 
          created_at: new Date(Date.now() - 3600000).toISOString(), 
          is_read: true 
        }
      ];
      setNotifications(mockNotifs);
    } catch (e) {
      console.error("Erreur notifications:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handlePress = (notif: Notification) => {
    // Marquer comme lu localement
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    
    // Redirection contextuelle vers le dossier rattaché
    if (notif.related_id) {
      const targetScreen = ROLE_SCREENS[role] || ROLE_SCREENS.citizen;
      navigation.navigate(targetScreen, { 
        id: notif.related_id, 
        complaintId: notif.related_id, // Supporte les deux formats de paramètres
        caseId: notif.related_id 
      });
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.is_read;
    const config = {
      CASE_UPDATE: { icon: "document-text", color: primaryColor },
      ALERT: { icon: "shield-alert", color: "#EF4444" },
      APPOINTMENT: { icon: "calendar", color: "#10B981" },
      SIGNATURE: { icon: "key", color: "#6366F1" }
    }[item.type] || { icon: "notifications", color: primaryColor };

    return (
      <TouchableOpacity 
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
        style={[
          styles.notifCard, 
          { 
            backgroundColor: "#FFFFFF", 
            borderLeftColor: isUnread ? config.color : "#E2E8F0",
            borderLeftWidth: isUnread ? 6 : 1,
            borderColor: "#F1F5F9"
          }
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: isUnread ? config.color + "12" : "#F8FAFC" }]}>
          <Ionicons name={config.icon as any} size={22} color={isUnread ? config.color : "#94A3B8"} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <Text style={[styles.notifTitle, { color: "#1E293B", fontWeight: isUnread ? "900" : "700" }]}>{item.title}</Text>
            {isUnread && <View style={[styles.unreadDot, { backgroundColor: config.color }]} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <View style={styles.footerRow}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.timeText}>
                {new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
              </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader 
        title="Alertes & Notifications" 
        showBack={true} 
        rightElement={
          notifications.some(n => !n.is_read) && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.headerBtn}>
              <Ionicons name="checkmark-done" size={24} color="#FFF" />
            </TouchableOpacity>
          )
        }
      />
      
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.loaderText}>Chargement des alertes judiciaires...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listPadding}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => { setRefreshing(true); fetchNotifications(); }} 
                tintColor={primaryColor} 
              />
            }
            ListHeaderComponent={() => (
              <View style={styles.listHeader}>
                  <Text style={styles.headerLabel}>Fil d'actualité</Text>
                  {notifications.filter(n => !n.is_read).length > 0 && (
                      <View style={[styles.countBadge, { backgroundColor: primaryColor }]}>
                          <Text style={styles.badgeText}>{notifications.filter(n => !n.is_read).length} NOUVEAUX</Text>
                      </View>
                  )}
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptySub}>Vos alertes judiciaires apparaîtront ici.</Text>
              </View>
            )}
          />
        )}
      </View>
      
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, fontSize: 13, fontWeight: '700', color: '#64748B' },
  headerBtn: { padding: 8 },
  listPadding: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 140 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  headerLabel: { fontSize: 11, fontWeight: "900", color: "#94A3B8", textTransform: 'uppercase', letterSpacing: 1 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  
  notifCard: { flexDirection: 'row', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1, alignItems: 'center', elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 15 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifTitle: { fontSize: 15, letterSpacing: -0.2 },
  message: { fontSize: 13, marginTop: 4, color: "#64748B", fontWeight: '500', lineHeight: 18 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  timeText: { fontSize: 10, color: "#94A3B8", fontWeight: "800" },

  emptyBox: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginTop: 15 },
  emptySub: { textAlign: 'center', color: '#64748B', marginTop: 8, fontSize: 14, fontWeight: '500' }
});