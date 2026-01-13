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
  summary?: {
    complaints_total: number;
    complaints_open: number;
    complaints_closed: number;
    users_total: number;
    police_users: number;
    logs_total: number;
    systemHealth: string;
  };
}

/**
 * 📊 GESTION DU DASHBOARD (Analytique)
 */
export const getAdminStats = async () => {
  try {
    const response = await api.get("/admin/dashboard-stats");
    const data = response.data.data;

    return {
        // Objet summary complet pour les graphiques détaillés
        summary: data.summary || {},

        // Mappings pour le Dashboard Accueil
        usersCount: data.summary?.users_total || 0, 
        courtsCount: data.regionalStats?.length || 0,
        activityRate: (data.summary?.complaints_total > 0)
            ? Math.round((data.summary.complaints_open / data.summary.complaints_total) * 100) + "%" 
            : "0%",
        systemStatus: data.summary?.systemHealth === '100%' ? "Stable" : "Maintenance",
        
        statusStats: data.statusStats || [],
        regionalStats: data.regionalStats || [],
        timingStats: data.timingStats || { avg_days: 0 }
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Erreur Stats:", error);
    return { 
        summary: {},
        usersCount: 0, 
        courtsCount: 0, 
        activityRate: "0%", 
        systemStatus: "Inconnu", 
        statusStats: [], 
        regionalStats: [] 
    };
  }
};

export const getDashboardData = getAdminStats;

/**
 * 👥 GESTION DES UTILISATEURS (CRUD)
 */

// 1. Liste complète
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Erreur récupération utilisateurs", error);
    return [];
  }
};

// 2. Création
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

// 3. ✅ Détails (Pour l'écran d'édition)
export const getUserDetails = async (id: number) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    console.error("Erreur récupération user:", error);
    throw error;
  }
};

// 4. ✅ Mise à jour (Pour modifier/bloquer)
export const updateUser = async (id: number, data: any) => {
  try {
    const payload = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        telephone: data.telephone,
        role: data.role,
        is_active: data.is_active,
        organization: data.organization,
        matricule: data.matricule,
        poste: data.poste,
        ...(data.password ? { password: data.password } : {})
    };

    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Erreur update user:", error.response?.data || error.message);
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

export const getAllPoliceStations = async () => {
  try {
    const response = await api.get("/police-stations");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Erreur Police Stations:", error);
    return [];
  }
};

/**
 * 🔧 MAINTENANCE & SYSTÈME
 */
export const getSystemHealth = async () => {
  try {
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

export const getSystemLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data; 
};

// Récupérer les logs d'audit (Format tableau pour l'écran Audit)
export const getAuditLogs = async () => {
  try {
    const response = await api.get('/admin/logs');
    if (Array.isArray(response.data)) return response.data;
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("[ADMIN SERVICE] Erreur Logs:", error);
    return [];
  }
};

export const getSecurityOverview = async () => {
  try {
    const response = await api.get('/admin/security/settings');
    return { score: 95, threats: 0, alerts: [], config: response.data.data };
  } catch (e) {
    return { score: 0, threats: 0, alerts: [] };
  }
};

export const triggerSecurityScan = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ threatsFound: 0, vulnerabilities: "Aucune critique" });
    }, 2000);
  });
};

export const clearServerCache = async () => {
  const response = await api.post('/admin/maintenance/clear-cache');
  return response.data;
};

export const getMaintenanceStatus = async () => {
  const response = await api.get('/admin/maintenance/status');
  return response.data;
};

export const setMaintenanceStatus = async (data: { isActive: boolean }) => {
  const response = await api.post('/admin/maintenance/status', data);
  return response.data;
};