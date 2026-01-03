import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// ✅ Services alignés avec ton nettoyage
import { createComplaint, uploadAttachment } from '../services/complaint.service';
import OfflineService from '../utils/offlineQueue';

// Doit correspondre à la clé utilisée dans utils/offlineQueue.ts
const QUEUE_KEY = '@offline_queue'; 

export const SyncManager = () => {
  const isProcessing = useRef(false);

  useEffect(() => {
    // 📡 Écouteur de changement de connexion
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      
      if (isOnline && !isProcessing.current) {
        processQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  const processQueue = async () => {
    if (isProcessing.current) return;

    try {
      isProcessing.current = true;

      // 1. Récupération via le service (plus propre que AsyncStorage direct)
      const queue = await OfflineService.getQueue();

      if (queue.length === 0) {
        isProcessing.current = false;
        return;
      }

      // 📢 Notification début de synchro
      Toast.show({
        type: 'info',
        text1: 'Connexion rétablie',
        text2: `Envoi de ${queue.length} élément(s) en attente...`,
        position: 'bottom'
      });

      const remaining = [];
      let successCount = 0;

      for (const item of queue) {
        try {
          // ✅ Logique métier spécifique
          // On vérifie 'resource' (défini dans offlineQueue.ts)
          
          if (item.resource === 'complaints' && item.action === 'create') {
            await createComplaint(item.data);
          } 
          else if (item.resource === 'attachments') {
            // item.data doit contenir { complaintId, file }
            await uploadAttachment(item.data.complaintId, item.data.file);
          }
          
          // Si d'autres types d'actions existent (ex: update), ajoute-les ici
          
          successCount++;
          console.log(`[SYNC] Succès pour l'item ${item.id}`);

        } catch (e) {
          console.error(`[SYNC] Échec item ${item.id}:`, e);
          // On garde l'élément en cas d'échec pour réessayer plus tard
          // On incrémente un compteur d'essais pour éviter les boucles infinies
          item.retryCount = (item.retryCount || 0) + 1;
          
          if (item.retryCount < 5) {
            remaining.push(item);
          }
        }
      }

      // 2. Mise à jour du stockage local (On écrase la file avec les restants)
      // Note: On utilise AsyncStorage directement ici pour écraser la liste complète
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));

      // 📢 Notification Succès
      if (successCount > 0) {
        Toast.show({
          type: 'success',
          text1: 'Synchronisation terminée',
          text2: `${successCount} dossier(s) transmis au serveur.`,
          position: 'bottom'
        });
      }

      // 📢 Notification Échec partiel
      if (remaining.length > 0) {
        Toast.show({
          type: 'error',
          text1: 'Synchronisation incomplète',
          text2: `${remaining.length} élément(s) ont échoué.`,
          position: 'bottom'
        });
      }

    } catch (error) {
      console.error("Erreur fatale SyncManager:", error);
    } finally {
      isProcessing.current = false;
    }
  };

  return null; // Composant invisible (Service de fond)
};