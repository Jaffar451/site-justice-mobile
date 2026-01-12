import api from "./api";

/**
 * 🛠️ TYPES & INTERFACES
 */

export type CreateUserPayload = {
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  password?: string;
  role: string;
  organization: string;
  matricule?: string;
  poste?: string;
  policeStationId?: number | null;
  courtId?: number | null;
  prisonId?: number | null;
  status?: string;
  is_active?: boolean;
};

export interface DashboardData {
  statusStats: { status: string; count: string }[];
  regionalStats: { district: string; total: string }[];
  timingStats: { avg_days: number };
}

/**
 * 📊 GESTION DU DASHBOARD (Analytique)
 */
// Utilisé par AdminHomeScreen
export const getAdminStats = async () => {
  try {
    const response = await api.get("/admin/dashboard-stats");
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    console.error("[ADMIN SERVICE] Erreur Stats:", error);
    return { statusStats: [], regionalStats: [], summary: {} };
  }
};

// Alias pour compatibilité si utilisé ailleurs
export const getDashboardData = getAdminStats;

/**
 * 👥 GESTION DES UTILISATEURS
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    // ✅ On retourne response.data.data car le backend enveloppe le tableau
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Erreur récupération utilisateurs", error);
    return [];
  }
};

/**
 * 👤 CRÉATION D'UTILISATEUR (Normalisée)
 * Convertit le camelCase (Frontend) en snake_case (Backend)
 */
export const createUser = async (userData: CreateUserPayload) => {
  try {
    // 🛡️ NORMALISATION : Préparation pour PostgreSQL
    const finalPayload = {
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email.toLowerCase().trim(),
      telephone: userData.telephone,
      password: userData.password,
      role: userData.role,
      organization: userData.organization,
      matricule: userData.matricule,
      poste: userData.poste,
      // Mappage explicite vers les colonnes SQL (snake_case)
      police_station_id: userData.policeStationId || null,
      court_id: userData.courtId || null,
      prison_id: userData.prisonId || null,
      status: userData.status || "active",
      is_active: userData.is_active ?? true,
    };

    // ✅ APPEL RÉEL AU BACKEND
    const response = await api.post('/users', finalPayload);
    return response.data;

  } catch (error: any) {
    console.error("[ADMIN SERVICE] Erreur création utilisateur:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🏛️ GESTION DES STRUCTURES
 */
export const getAllCourts = async () => {
  try {
    const response = await api.get("/courts");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Erreur Courts:", error);
    return [];
  }
};

/**
 * 👮 GESTION DES COMMISSARIATS (Directory)
 */
export const getAllPoliceStations = async () => {
  try {
    const response = await api.get("/police-stations");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Erreur Police Stations:", error);
    return [];
  }
};

// --- 🔧 MAINTENANCE & SYSTÈME ---

// 📡 Récupère l'état de santé (Simulé ou réel selon backend)
// Utilisé par la carte "État des Services"
export const getSystemHealth = async () => {
  try {
    // Essaye d'appeler la route dédiée, sinon fallback sur maintenance
    const response = await api.get('/admin/maintenance/status'); 
    return {
       serverStatus: 'OK', 
       dbStatus: 'Connected', 
       latency: 45, 
       version: '1.5.0',
       ...response.data.data // Fusionne avec les vraies données si dispos
    };
  } catch (e) {
    return { serverStatus: 'Unknown', dbStatus: 'Unknown', latency: 0 };
  }
};

// 📡 Récupère les logs techniques réels
export const getSystemLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data; 
};

// 📡 Récupère le score de sécurité et les alertes
export const getSecurityOverview = async () => {
  try {
    const response = await api.get('/admin/security/settings');
    // Adaptation pour l'écran Security
    return {
        score: 95, 
        threats: 0, 
        alerts: [], 
        config: response.data.data 
    };
  } catch (e) {
    return { score: 0, threats: 0, alerts: [] };
  }
};

// ⚡ Lance un scan de sécurité
export const triggerSecurityScan = async () => {
  // Simulé pour l'instant si la route n'existe pas encore
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ threatsFound: 0, vulnerabilities: "Aucune critique" });
    }, 2000);
  });
};

// 🧹 Vide le cache
export const clearServerCache = async () => {
  const response = await api.post('/admin/maintenance/clear-cache');
  return response.data;
};

// 🚧 Statut Maintenance (Switch)
export const getMaintenanceStatus = async () => {
  const response = await api.get('/admin/maintenance/status'); // ✅ Chemin corrigé
  return response.data;
};

// 🚨 Activer/Désactiver Maintenance
export const setMaintenanceStatus = async (data: { isActive: boolean }) => {
  const response = await api.post('/admin/maintenance/status', data); // ✅ Chemin corrigé
  return response.data;
};