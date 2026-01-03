import api from "./api";

/**
 * 🏢 Interface représentant une Unité (Police, Gendarmerie, etc.)
 */
export interface PoliceStation {
  id: number;
  name: string;
  type: 'POLICE' | 'GENDARMERIE' | 'TRIBUNAL' | 'COUR_APPEL';
  district: string;
  city: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 📦 Structure de réponse standardisée du Backend
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * 📥 RÉCUPÉRER TOUTES LES UNITÉS
 */
export const getAllStations = async (): Promise<PoliceStation[]> => {
  try {
    const response = await api.get<ApiResponse<PoliceStation[]> | PoliceStation[]>("/police-stations");
    
    console.log("[STATION SERVICE] Réponse reçue :", response.data);

    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        return response.data.data;
      }
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error: any) {
    console.error("[STATION SERVICE] Erreur lors de la récupération :", error.message);
    return []; 
  }
};

/**
 * 🔍 RÉCUPÉRER UNE UNITÉ PAR SON ID
 */
export const getStationById = async (id: number): Promise<PoliceStation | null> => {
  try {
    const response = await api.get<ApiResponse<PoliceStation> | PoliceStation>(`/police-stations/${id}`);
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data.success ? response.data.data : null;
    }
    return response.data as PoliceStation;
  } catch (error) {
    console.error(`[STATION SERVICE] Erreur station ${id} :`, error);
    return null;
  }
};

/**
 * ✨ CRÉER UNE NOUVELLE UNITÉ
 */
export const createStation = async (
  data: Omit<PoliceStation, "id" | "createdAt" | "updatedAt">
): Promise<PoliceStation> => {
  try {
    const response = await api.post<ApiResponse<PoliceStation> | PoliceStation>("/police-stations", data);
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data.data;
    }
    return response.data as PoliceStation;
  } catch (error: any) {
    console.error("[STATION SERVICE] Erreur création :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📝 METTRE À JOUR UNE UNITÉ
 */
export const updateStation = async (
  id: number, 
  data: Partial<PoliceStation>
): Promise<PoliceStation> => {
  try {
    const response = await api.put<ApiResponse<PoliceStation> | PoliceStation>(`/police-stations/${id}`, data);
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data.data;
    }
    return response.data as PoliceStation;
  } catch (error: any) {
    console.error("[STATION SERVICE] Erreur mise à jour :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🗑️ SUPPRIMER UNE UNITÉ
 * ✅ Correction de l'erreur TS 2322 : Garantie d'un retour de type 'string'
 */
export const deleteStation = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete<ApiResponse<any>>(`/police-stations/${id}`);
    return { 
      // Utilisation de ?? pour garantir que si 'message' est undefined, on renvoie une valeur par défaut
      message: response.data?.message ?? "L'unité a été supprimée avec succès." 
    };
  } catch (error: any) {
    console.error("[STATION SERVICE] Erreur suppression :", error.response?.data || error.message);
    throw error;
  }
};