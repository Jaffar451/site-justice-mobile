import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * 🛡️ Vérification des habilitations
 * Gère les rôles multiples (ex: 'police' couvre officier, commissaire, etc.)
 */
const allow = (...allowedRoles: string[]) => {
  const user = useAuthStore.getState().user;
  const userRole = user?.role; 
  
  if (!userRole) {
    throw new Error("Utilisateur non identifié.");
  }

  // Normalisation pour les groupes de rôles
  const isPolice = ["officier_police", "commissaire", "inspecteur", "gendarme", "opj_gendarme"].includes(userRole);
  const isJustice = ["judge", "prosecutor", "greffier"].includes(userRole);

  // Vérification
  const hasAccess = allowedRoles.some(role => {
    if (role === "police") return isPolice; // "police" autorise tous les corps habillés
    if (role === "justice") return isJustice;
    return role === userRole; // Vérification stricte (ex: "admin")
  });

  if (!hasAccess) {
    throw new Error(`Accès refusé. Rôle requis : ${allowedRoles.join(" ou ")}`);
  }
};

// ✅ L'interface inclut bien judgeId maintenant
export interface CreateArrestWarrantPayload {
  caseId: number;
  personName: string;
  reason: string;
  expiresAt?: string; 
  urgency: "normal" | "high" | "critical";
  judgeId?: number; // Mis en optionnel (?) pour éviter les erreurs si user.id est undefined côté UI
}

/**
 * ⚖️ Émission d'un mandat d'arrêt
 * Seul le Juge d'instruction peut ordonner l'arrestation.
 */
export const createArrestWarrant = async (payload: CreateArrestWarrantPayload) => {
  allow("judge"); // Seul le juge passe
  const res = await api.post("/arrest-warrants", payload);
  return res.data;
};

/**
 * 👮 Consultation pour exécution
 * La Police (tous grades), le Juge et l'Admin peuvent consulter.
 */
export const getActiveWarrants = async () => {
  // On autorise le groupe "police", le rôle "judge" et "admin"
  allow("police", "judge", "admin");
  const res = await api.get("/arrest-warrants/active");
  return res.data;
};

/**
 * 🛑 Annulation ou clôture d'un mandat
 */
export const updateWarrantStatus = async (id: number, status: "executed" | "cancelled") => {
  allow("judge", "admin", "commissaire"); // Le commissaire peut marquer comme exécuté
  const res = await api.patch(`/arrest-warrants/${id}/status`, { status });
  return res.data;
};
