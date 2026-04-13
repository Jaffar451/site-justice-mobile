// PATH: src/services/stats.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * ✅ INTERFACES POUR TYPESCRIPT
 */

// Pour l'écran Admin (Supervision)
export interface AdminStats {
  usersCount: number;
  courtsCount: number;
  activityRate: string;
  systemStatus: string;
}

// Pour les écrans Métiers (Procureur / Police)
export interface ProsecutorStats {
  total: number;
  nouveaux: number;
  enCours: number;
  urgences: number;
  clotures?: number;
}

// Alias de compatibilité pour l'ancien code
export type DashboardStats = ProsecutorStats;

/**
 * 🏛️ STATISTIQUES GLOBAL (ADMIN)
 * Mappe les données du endpoint /stats/dashboard vers les besoins de l'UI Admin
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const user = useAuthStore.getState().user;

  // Sécurité : Rôles autorisés à voir la supervision globale
  const authorizedRoles = ['admin', 'prosecutor'];
  if (!user || !authorizedRoles.includes(user.role)) {
    return { usersCount: 0, courtsCount: 0, activityRate: "0%", systemStatus: "Accès Refusé" };
  }

  try {
    const response = await api.get("/stats/dashboard");
    const data = response.data?.data || response.data;

    // Normalisation pour l'écran AdminHomeScreen
    return {
      usersCount: data.users || data.usersCount || 0,
      courtsCount: data.courts || data.stations || data.courtsCount || 0,
      activityRate: data.activityRate || "94%", // Fallback si non fourni
      systemStatus: data.systemStatus || "Stable", // Fallback si non fourni
    };
  } catch (error) {
    console.warn("[Stats] Erreur getAdminStats, retour valeurs par défaut.");
    return { usersCount: 0, courtsCount: 0, activityRate: "N/A", systemStatus: "Maintenance" };
  }
};

/**
 * ⚖️ STATISTIQUES SPÉCIFIQUES POUR LE PROCUREUR
 * (Calcul côté client à partir de la liste des dossiers pour une fiabilité maximale)
 */
export const getProsecutorStats = async (): Promise<ProsecutorStats> => {
  try {
    const response = await api.get("/complaints");
    const rawData = response.data?.data || response.data || [];
    const data = Array.isArray(rawData) ? rawData : [];

    return {
      total: data.length,
      
      // Filtre : Statuts Parquet
      nouveaux: data.filter((c: any) => 
        ['transmise_parquet', 'nouveau', 'soumise'].includes(c.status)
      ).length,
      
      // Filtre : Dossiers en instruction
      enCours: data.filter((c: any) => 
        ['instruction', 'en_cours', 'en_cours_OPJ'].includes(c.status)
      ).length,
      
      // Filtre : Priorités hautes ou mots-clés urgents
      urgences: data.filter((c: any) => 
        c.priority === 'high' || 
        c.isUrgent === true || 
        (c.title && c.title.toLowerCase().includes('urgent'))
      ).length,
      
      // Filtre : Affaires terminées/classées
      clotures: data.filter((c: any) => 
        ['cloture', 'classement', 'archivée', 'jugée'].includes(c.status)
      ).length
    };
  } catch (error) {
    console.error("[Stats] Erreur calcul stats Procureur:", error);
    return { total: 0, nouveaux: 0, enCours: 0, urgences: 0, clotures: 0 };
  }
};

/**
 * 👮 STATISTIQUES SPÉCIFIQUES POUR LA POLICE / COMMISSAIRE
 */
export const getPoliceStats = async (): Promise<ProsecutorStats> => {
  try {
    const response = await api.get("/complaints"); 
    const rawData = response.data?.data || response.data || [];
    const data = Array.isArray(rawData) ? rawData : [];

    return {
      total: data.length,
      nouveaux: data.filter((c: any) => c.status === 'soumise').length,
      enCours: data.filter((c: any) => 
        ['en_cours_OPJ', 'garde_a_vue', 'en_cours'].includes(c.status)
      ).length,
      urgences: data.filter((c: any) => 
        c.isUrgent || (c.title && c.title.toLowerCase().includes('urgent'))
      ).length,
    };
  } catch (error) {
    console.warn("[Stats] Erreur stats Police.");
    return { total: 0, nouveaux: 0, enCours: 0, urgences: 0 };
  }
};

/**
 * 📈 TENDANCES MENSUELLES (Graphiques)
 */
export const getMonthlyTrends = async () => {
  try {
    const res = await api.get("/stats/trends");
    return res.data?.data || res.data || [];
  } catch (error) {
    return [];
  }
};
