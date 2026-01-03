// PATH: src/services/notification.service.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * ✅ INTERFACE DES NOTIFICATIONS
 */
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: any;           // Données liées (ex: { caseId: 102 })
  createdAt: string;
  isRead: boolean;
  type?: 'status_change' | 'new_hearing' | 'new_decision' | 'admin_alert';
}

// Configuration globale du comportement (en premier plan)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * 📥 RÉCUPÉRATION DE L'HISTORIQUE (INBOX)
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
 * 📲 ENREGISTREMENT DU TOKEN PUSH (MOBILE)
 * Synchronise l'appareil physique avec le compte utilisateur e-Justice.
 */
export async function registerForPushNotificationsAsync() {
  // 🛡️ Sécurité Web & Émulateur
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) {
    console.warn("🔔 [NOTIF] Notifications Push désactivées (Émulateur/Simulateur)");
    return null;
  }

  let token: string | undefined;

  // A. Vérification des permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn("🔔 [NOTIF] Permissions refusées par l'utilisateur.");
    return null;
  }

  // B. Récupération du Token Expo
  try {
    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId ?? 
      Constants.easConfig?.projectId;
    
    if (!projectId) {
      throw new Error("Project ID manquant. Vérifiez app.json.");
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    // C. Synchronisation avec le Backend
    if (token) {
      await api.patch('/users/push-token', { pushToken: token });
      console.log("✅ [NOTIF] Push Token synchronisé avec succès.");
    }
  } catch (error) {
    console.error("❌ [NOTIF] Échec liaison token:", error);
  }

  // D. Configuration du canal Android (Canal prioritaire Justice)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications e-Justice Niger',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#006400', // Vert drapeau Niger
    });
  }

  return token;
}

/**
 * 🛠️ ACTIONS DE LECTURE
 */

// Marquer une notification spécifique comme lue
export const markAsRead = async (notificationId: string) => {
  try {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  } catch (error) {
    console.error(`[NOTIF SERVICE] Erreur lecture ${notificationId}:`, error);
  }
};

// Marquer toutes les notifications comme lues
export const markAllAsRead = async () => {
  try {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  } catch (error) {
    console.error("[NOTIF SERVICE] Erreur lecture globale:", error);
  }
};