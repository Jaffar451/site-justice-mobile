// PATH: src/services/audit.service.ts
import api from "./api";

/**
 * 🛡️ INTERFACES DE SÉCURITÉ (REGISTRE D'AUDIT)
 * Conforme aux normes de traçabilité du Ministère de la Justice.
 */
export interface LogEntry {
  id: number;
  userId: number | null; 
  targetUserId?: number | null;
  action: string;
  details?: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  ip: string;
  timestamp: string;
  hash: string; // Signature pour détecter toute modification manuelle en DB
  actor?: {
    firstname: string;
    lastname: string;
    role: string;
    matricule: string;
  };
}

/**
 * 🛠️ APPELS API
 */

/**
 * 📋 RÉCUPÉRER LE REGISTRE NATIONAL (ADMIN ONLY)
 * ✅ AJOUT : Alias getAuditLogs pour compatibilité avec AdminAuditTrailScreen
 */
export const getAuditLogs = async (): Promise<LogEntry[]> => {
  try {
    const res = await api.get<LogEntry[] | { success: boolean; data: LogEntry[] }>("/audit-logs");
    
    // Gestion flexible si le backend renvoie { success: true, data: [...] }
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      return res.data.data;
    }
    
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("[AUDIT SERVICE] Erreur récupération logs:", error);
    return [];
  }
};

/**
 * 📋 RÉCUPÉRER LE REGISTRE NATIONAL (ADMIN ONLY) - Nom original conservé
 */
export const getSystemLogs = async (): Promise<LogEntry[]> => {
  return getAuditLogs();
};

/**
 * 🔍 RÉCUPÉRER LES LOGS D'UN ACTEUR SPÉCIFIQUE
 */
export const getLogsByActor = async (userId: number): Promise<LogEntry[]> => {
  const res = await api.get<LogEntry[]>(`/audit-logs/actor/${userId}`);
  return res.data;
};

/**
 * ✍️ CRÉATION DE LOG MANUEL (ACTION DE L'INTERFACE)
 * ✅ CORRECTION : Utilise /audit-logs au lieu de /logs/custom pour éviter la 404.
 */
export const logAdminAction = async (
  action: string, 
  targetUserId: number | null, 
  details: string
): Promise<void> => {
  try {
    // On normalise les clés pour PostgreSQL (snake_case)
    const payload = {
      action,
      target_user_id: targetUserId, // ✅ Correction naming
      details,
      timestamp: new Date().toISOString(),
    };

    // On utilise la route principale POST /audit-logs
    await api.post("/audit-logs", payload);
  } catch (error: any) {
    // ⚠️ On loggue l'erreur en console mais on ne bloque pas l'utilisateur 
    // car l'audit ne doit pas empêcher l'action métier de se terminer.
    console.warn(`[AUDIT FAIL] ${action} : ${error.response?.status === 404 ? 'Route non configurée' : 'Erreur serveur'}`);
  }
};

/**
 * ⚖️ VÉRIFICATION D'INTÉGRITÉ DU REGISTRE
 * Compare les hashs de la chaîne de logs pour détecter une intrusion.
 */
export const verifyLogsIntegrity = async (): Promise<{ isValid: boolean; tamperedLogs?: number[] }> => {
  try {
    const res = await api.get("/audit-logs/verify-integrity");
    return res.data;
  } catch (error) {
    return { isValid: false };
  }
};