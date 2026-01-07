import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from "./api";

/**
 * ✅ INTERFACE DES NOTIFICATIONS
 */
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: {
    screen?: string;
    sosId?: string | number;
    caseId?: string | number;
  };
  createdAt: string;
  isRead: boolean;
  type?: 'status_change' | 'new_hearing' | 'new_decision' | 'admin_alert' | 'sos_alert';
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * 📥 RÉCUPÉRATION DE L'HISTORIQUE
 */
export const getMyNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const res = await api.get<NotificationItem[]>("/notifications/my");
    return res.data;
  } catch (error) {
    console.error("[NOTIF SERVICE] Erreur récupération inbox:", error);
    return [];
  }
};

/**
 * 📲 ENREGISTREMENT DU TOKEN PUSH
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;
  
  if (!Device.isDevice) {
    console.warn("🔔 [NOTIF] Mode simulateur : pas de token push physique.");
    return null;
  }

  let token: string | undefined;

  // 1. Permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn("🔔 [NOTIF] Permissions refusées.");
    return null;
  }

  // 2. Récupération du Token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) throw new Error("Project ID manquant.");

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    if (token) {
      // ✅ On tente la synchro, mais on ne bloque pas si l'utilisateur n'est pas loggé
      api.patch('/users/push-token', { pushToken: token })
         .then(() => console.log("✅ [NOTIF] Token synchronisé."))
         .catch(err => console.log("⏳ [NOTIF] Token généré, en attente de connexion pour synchro."));
    }
  } catch (error) {
    console.error("❌ [NOTIF] Erreur token:", error);
  }

  // 3. Configuration des Canaux Android (CRITIQUE POUR SOS)
  if (Platform.OS === 'android') {
    // Canal Standard
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Standard',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    // 🚨 Canal Urgence SOS (Haute priorité)
    await Notifications.setNotificationChannelAsync('sos-alerts', {
      name: 'Alertes SOS & Urgences',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#FF0000', // Rouge alerte
      sound: 'default', // Idéalement, un son personnalisé ici
    });
  }

  return token;
}

export const markAsRead = async (notificationId: string) => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error(`[NOTIF SERVICE] Erreur lecture ${notificationId}:`, error);
  }
};