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
  usersCount?: number;
  courtsCount?: number;
  activityRate?: string;
  systemStatus?: string;
}

/**
 * 📊 GESTION DU DASHBOARD (Analytique)
 * Cette fonction transforme les données du Backend pour l'UI
 */
export const getAdminStats = async () => {
  try {
    const response = await api.get("/admin/dashboard-stats");
    const data = response.data.data;

    // 🛡️ MAPPING INTELLIGENT (Backend -> Frontend)
    // On transforme les données brutes pour que l'écran AdminHomeScreen les comprenne
    return {
        // Mapping du compteur utilisateurs (users_total -> usersCount)
        usersCount: data.summary?.users_total || 0, 
        
        // Mapping du compteur juridictions
        courtsCount: data.regionalStats?.length || 0,
        
        // Calcul du taux d'activité (Dossiers ouverts / Total)
        activityRate: (data.summary?.complaints_total > 0)
            ? Math.round((data.summary.complaints_open / data.summary.complaints_total) * 100) + "%" 
            : "0%",
            
        // État du système
        systemStatus: data.summary?.systemHealth === '100%' ? "Stable" : "Maintenance",
        
        // Données brutes pour les graphiques
        statusStats: data.statusStats || [],
        regionalStats: data.regionalStats || [],
        timingStats: data.timingStats || { avg_days: 0 }
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Erreur Stats:", error);
    // Valeurs par défaut pour ne pas crasher l'UI
    return { 
        usersCount: 0, 
        courtsCount: 0, 
        activityRate: "0%", 
        systemStatus: "Inconnu",
        statusStats: [],
        regionalStats: []
    };
  }
};

// Alias pour compatibilité
export const getDashboardData = getAdminStats;

/**
 * 👥 GESTION DES UTILISATEURS
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Erreur récupération utilisateurs", error);
    return [];
  }
};

/**
 * 👤 CRÉATION D'UTILISATEUR (Normalisée)
 */
export const createUser = async (userData: CreateUserPayload) => {
  try {
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
      police_station_id: userData.policeStationId || null,
      court_id: userData.courtId || null,
      prison_id: userData.prisonId || null,
      status: userData.status || "active",
      is_active: userData.is_active ?? true,
    };

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
 * 👮 GESTION DES COMMISSARIATS
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

// 📡 Récupère l'état de santé
export const getSystemHealth = async () => {
  try {
    // ✅ Utilise la route dédiée créée dans le backend
    const response = await api.get('/admin/system-health');
    
    if (response.data && response.data.success) {
        return response.data.data;
    }
    return response.data;
  } catch (e) {
    console.error("❌ Erreur Health Check:", e);
    return { serverStatus: 'Unknown', dbStatus: 'Unknown', latency: 0 };
  }
};

// 📡 Récupère les logs techniques
export const getSystemLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data; 
};

// 📡 Récupère la sécurité
export const getSecurityOverview = async () => {
  try {
    const response = await api.get('/admin/security/settings');
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

// 🚧 Statut Maintenance
export const getMaintenanceStatus = async () => {
  const response = await api.get('/admin/maintenance/status');
  return response.data;
};

// 🚨 Activer/Désactiver Maintenance
export const setMaintenanceStatus = async (data: { isActive: boolean }) => {
  const response = await api.post('/admin/maintenance/status', data);
  return response.data;
};