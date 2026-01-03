// PATH: src/services/stats.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * 📊 Récupère les données consolidées pour le tableau de bord Admin
 * Inclut : Utilisateurs, Dossiers (Cases) et Commissariats (Stations)
 */
export const getDashboardData = async () => {
  const user = useAuthStore.getState().user;

  // 🛡️ Vérification de sécurité côté client
  const authorizedRoles = ['admin', 'prosecutor', 'commissaire', 'judge'];
  if (!user || !authorizedRoles.includes(user.role)) {
    throw new Error("Accès refusé : Droits insuffisants pour consulter les statistiques.");
  }

  try {
    // Appel vers l'endpoint backend unique qui agrège toutes les stats
    const response = await api.get("/stats/dashboard");
    return response.data;
  } catch (error) {
    console.error("Erreur getDashboardData:", error);
    throw error;
  }
};

/**
 * 📈 Optionnel : Récupérer uniquement les tendances mensuelles
 */
export const getMonthlyTrends = async () => {
  const res = await api.get("/stats/trends");
  return res.data;
};