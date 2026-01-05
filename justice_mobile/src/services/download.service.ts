// PATH: src/services/download.service.ts
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = 'my_downloads_metadata';

export interface DownloadedItem {
  id: string;
  title: string;
  localUri: string;
  mimeType: string;
  downloadedAt: string;
}

// 1. Sauvegarder un fichier
export const downloadAndSave = async (url: string, title: string, id: string) => {
  try {
    // Créer un nom de fichier unique dans le dossier DOCUMENTS (permanent)
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const fileUri = FileSystem.documentDirectory + filename;

    // Télécharger
    const downloadRes = await FileSystem.downloadAsync(url, fileUri);

    if (downloadRes.status !== 200) throw new Error("Échec du téléchargement");

    // Créer la métadonnée
    const newItem: DownloadedItem = {
      id,
      title,
      localUri: downloadRes.uri,
      mimeType: 'application/pdf',
      downloadedAt: new Date().toISOString(),
    };

    // Mettre à jour la liste dans AsyncStorage
    const currentList = await getDownloads();
    // On évite les doublons (si déjà téléchargé, on met à jour)
    const newList = [newItem, ...currentList.filter(i => i.id !== id)];
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    return newItem;

  } catch (error) {
    console.error("Erreur downloadAndSave:", error);
    throw error;
  }
};

// 2. Récupérer la liste des téléchargements
export const getDownloads = async (): Promise<DownloadedItem[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    return [];
  }
};

// 3. Supprimer un téléchargement
export const deleteDownload = async (id: string) => {
  try {
    const list = await getDownloads();
    const item = list.find(i => i.id === id);

    if (item) {
      // Supprimer le fichier physique
      await FileSystem.deleteAsync(item.localUri, { idempotent: true });
      
      // Mettre à jour la liste
      const newList = list.filter(i => i.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
  } catch (error) {
    console.error("Erreur suppression:", error);
  }
};

// 4. Ouvrir un fichier
export const openFile = async (localUri: string) => {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(localUri);
  }
};