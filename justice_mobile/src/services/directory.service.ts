// PATH: src/services/directory.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * ✅ INTERFACE DE LIEU (PLACE)
 * Regroupe les entités pour l'annuaire national
 */
export interface Place {
  id: number;
  name: string;
  type: 'tribunal' | 'commissariat' | 'maison_arret' | 'gendarmerie';
  city: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  opening_hours?: string; // ex: "08:00 - 17:30"
  status: 'active' | 'inactive';
}

/**
 * 🛡️ GARDE DE SÉCURITÉ
 */
const allowAdmin = () => {
  const user = useAuthStore.getState().user;
  if (user?.role !== 'admin') {
    throw new Error("Action réservée aux administrateurs système.");
  }
};

/**
 * 📖 RÉCUPÉRER L'ANNUAIRE COMPLET
 * Supporte le filtrage par ville ou par type
 */
export const getPlaces = async (params?: { city?: string; type?: string }): Promise<Place[]> => {
  try {
    const res = await api.get<Place[]>("/directory", { params });
    return res.data;
  } catch (error) {
    console.error("[DIRECTORY SERVICE] Erreur récupération annuaire:", error);
    return [];
  }
};

/**
 * 🔍 DÉTAILS D'UN ÉTABLISSEMENT
 */
export const getPlaceById = async (id: number): Promise<Place> => {
  const res = await api.get<Place>(`/directory/${id}`);
  return res.data;
};

/**
 * ➕ AJOUTER UNE ENTRÉE (Admin)
 */
export const createPlace = async (data: Partial<Place>): Promise<Place> => {
  allowAdmin();
  try {
    // Normalisation des coordonnées pour éviter l'erreur 400 SQL
    const payload = {
      ...data,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      status: data.status || 'active'
    };
    const res = await api.post<Place>("/directory", payload);
    return res.data;
  } catch (error: any) {
    console.error("[DIRECTORY SERVICE] Erreur création:", error.response?.data);
    throw error;
  }
};

/**
 * 📝 MODIFIER UNE ENTRÉE (Admin)
 */
export const updatePlace = async (id: number, data: Partial<Place>): Promise<Place> => {
  allowAdmin();
  const res = await api.put<Place>(`/directory/${id}`, data);
  return res.data;
};

/**
 * 🗑️ SUPPRIMER UNE ENTRÉE (Admin)
 */
export const deletePlace = async (id: number): Promise<void> => {
  allowAdmin();
  await api.delete(`/directory/${id}`);
};