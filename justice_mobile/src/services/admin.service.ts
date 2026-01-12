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
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    // ✅ APPEL RÉEL AU BACKEND
    const response = await api.get("/admin/dashboard-stats");
    
    // Si le backend renvoie { success: true, data: { statusStats: [...] } }
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error("Format de réponse invalide");
  } catch (error) {
    console.error("[ADMIN SERVICE] Erreur Stats:", error);
    // Retourne des données par défaut pour éviter de casser les graphiques
    return {
      statusStats: [],
      regionalStats: [],
      timingStats: { avg_days: 0 }
    };
  }
};

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

// 📡 Récupère l'état de santé du serveur (CPU, RAM, Base de données)
export const getSystemHealth = async () => {
  const response = await api.get('/admin/system-health');
  return response.data; // { server: "OK", db: "Connected", latency: 120, version: "1.0.5" }
};

// 📡 Récupère les logs techniques réels
export const getSystemLogs = async () => {
  const response = await api.get('/admin/logs');
  return response.data; // [{ time: "...", level: "ERROR", message: "..." }]
};

// 📡 Récupère le score de sécurité et les alertes
export const getSecurityOverview = async () => {
  const response = await api.get('/admin/security/overview');
  return response.data; // { score: 92, threats: 0, activeSessions: 14 }
};

// ⚡ Lance un scan de sécurité côté serveur
export const triggerSecurityScan = async () => {
  const response = await api.post('/admin/security/scan');
  return response.data;
};

// 🧹 Vide le cache côté serveur (Laravel/Node)
export const clearServerCache = async () => {
  const response = await api.post('/admin/maintenance/clear-cache');
  return response.data;
};