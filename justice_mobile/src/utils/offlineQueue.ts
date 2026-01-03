import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '../services/api'; 

// Clé de stockage
const QUEUE_KEY = '@offline_queue';

interface QueueItem {
  id: string;
  resource: string; // ex: 'complaints'
  action: 'create' | 'update' | 'patch';
  data: any;
  timestamp: number;
  retryCount: number;
}

const OfflineService = {
  /**
   * 📥 Ajoute une action à la file d'attente
   */
  addToQueue: async (resource: string, action: 'create' | 'update' | 'patch', data: any) => {
    try {
      const currentQueue = await OfflineService.getQueue();
      const newItem: QueueItem = {
        id: Date.now().toString(), // ID unique temporaire
        resource,
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      const newQueue = [...currentQueue, newItem];
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
      console.log(`[OFFLINE] Ajouté à la file: ${resource}/${action}`);
    } catch (error) {
      console.error("Erreur ajout queue:", error);
    }
  },

  /**
   * 📤 Récupère la file actuelle
   */
  getQueue: async (): Promise<QueueItem[]> => {
    try {
      const json = await AsyncStorage.getItem(QUEUE_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch (error) {
      return [];
    }
  },

  /**
   * 📏 Taille de la file (pour les badges)
   */
  getQueueSize: async (): Promise<number> => {
    const queue = await OfflineService.getQueue();
    return queue.length;
  },

  /**
   * 🚀 Traite la file d'attente (Synchronisation)
   */
  processQueue: async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return; // Pas de réseau, on ne fait rien

    const queue = await OfflineService.getQueue();
    if (queue.length === 0) return;

    console.log(`[SYNC] Traitement de ${queue.length} éléments...`);
    
    const failedItems: QueueItem[] = [];

    for (const item of queue) {
      try {
        // Construction dynamique de l'URL
        let url = `/${item.resource}`;
        if (item.action === 'update' || item.action === 'patch') {
           // Si c'est un update, on suppose que data contient l'ID
           if (item.data.id && item.data.id > 0) {
             url += `/${item.data.id}`;
           } else {
             // Si l'ID est négatif (créé hors ligne), on ne peut pas update
             // On doit attendre que le backend renvoie le vrai ID.
             // (Logique simplifiée ici : on ignore ou on recrée)
             continue; 
           }
        }

        // Envoi à l'API
        if (item.action === 'create') await api.post(url, item.data);
        else if (item.action === 'update') await api.put(url, item.data);
        else if (item.action === 'patch') await api.patch(url, item.data);

        console.log(`[SYNC] Succès: ${item.id}`);
      } catch (error) {
        console.error(`[SYNC] Échec pour ${item.id}`, error);
        // On garde l'item s'il a échoué, on incrémente le retry
        item.retryCount += 1;
        if (item.retryCount < 5) { // Max 5 essais
          failedItems.push(item);
        }
      }
    }

    // Sauvegarde des éléments restants (ceux qui ont échoué)
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));
  },

  /**
   * 🗑️ Vide la file (Logout ou Debug)
   */
  clearQueue: async () => {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
};

export default OfflineService;