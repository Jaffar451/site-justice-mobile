// PATH: src/stores/notifications.store.ts
import { create } from "zustand";
import { secureGet, secureSet } from "../utils/secureStorage"; 

export type NotificationType = 'alert' | 'info' | 'system';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string; 
};

export type NotificationState = {
  list: NotificationItem[];
  getUnreadCount: () => number;
  load: () => Promise<void>;
  add: (item: { title: string; message: string; type?: NotificationType }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>; // ✅ Ajouté pour le Swipe
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "notifications_data"; // Changé pour éviter tout conflit de cache ancien

export const useNotificationStore = create<NotificationState>((set, get) => ({
  list: [],

  getUnreadCount: () => {
    return get().list.filter((n) => !n.read).length;
  },

  load: async () => {
    const savedString = await secureGet(STORAGE_KEY);
    if (savedString) {
      try {
        const saved = JSON.parse(savedString) as NotificationItem[];
        set({ list: saved });
      } catch (e) {
        set({ list: [] });
      }
    } else {
        // Initialisation avec une notification de bienvenue si vide
        const welcome = [{
            id: '1', 
            title: 'Bienvenue', 
            message: 'Système Justice Mobile initialisé.', 
            type: 'system' as NotificationType, 
            read: false, 
            createdAt: new Date().toISOString()
        }];
        set({ list: welcome });
        await secureSet(STORAGE_KEY, JSON.stringify(welcome));
    }
  },

  add: async ({ title, message, type = 'info' }) => {
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNotif, ...get().list];
    set({ list: updated });
    await secureSet(STORAGE_KEY, JSON.stringify(updated));
  },

  markAsRead: async (id) => {
    const updated = get().list.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ list: updated });
    await secureSet(STORAGE_KEY, JSON.stringify(updated));
  },

  // ✅ Nouvelle méthode pour gérer la suppression individuelle proprement
  remove: async (id) => {
    const updated = get().list.filter((n) => n.id !== id);
    set({ list: updated });
    await secureSet(STORAGE_KEY, JSON.stringify(updated));
  },

  clearAll: async () => {
    set({ list: [] });
    await secureSet(STORAGE_KEY, JSON.stringify([]));
  }
}));