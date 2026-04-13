// PATH: src/services/decision.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * ✅ INTERFACE DE LA DÉCISION DE JUSTICE
 * Représente l'acte final d'une procédure judiciaire.
 */
export interface Decision {
  id: number;
  caseId: number;
  judgeId: number;
  content: string;      // Le corps de la décision (Le "Par ces motifs")
  verdict: "guilty" | "not_guilty" | "dismissed" | "acquittal" | "conviction" | string; // 'string' ajouté pour flexibilité
  date: string;         // Date du prononcé
  isSigned: boolean;    // ✅ État de la signature électronique
  signatureDate?: string;
  createdAt?: string;
  updatedAt?: string;

  // ✅ CHAMPS AJOUTÉS POUR LA CONFISCATION (Fix TS Error 2559)
  confiscations?: any[]; 
  confiscationDate?: string;
  judgeSignature?: string;
}

/**
 * 🛡️ GARDE DE SÉCURITÉ CLIENT
 * Bloque l'exécution si l'utilisateur n'a pas les droits nécessaires.
 */
const allow = (...authorizedRoles: string[]) => {
  const user = useAuthStore.getState().user;
  const role = user?.role;
  
  if (!role || !authorizedRoles.includes(role)) {
    const errorMsg = `Accès refusé — Le rôle '${role}' n'est pas autorisé à effectuer cette action.`;
    console.warn(`[Security] ${errorMsg}`);
    // On peut choisir de throw ou juste warn selon la stratégie, ici throw pour bloquer
    throw new Error(errorMsg);
  }
};

/**
 * 🔹 RÉCUPÉRER LA DÉCISION LIÉE À UN DOSSIER
 */
export const getDecisionByCase = async (caseId: number): Promise<Decision> => {
  // Le citoyen peut voir la décision s'il est partie au procès
  allow("judge", "clerk", "admin", "citizen", "prosecutor", "lawyer");
  const res = await api.get<Decision>(`/decisions/case/${caseId}`);
  return res.data;
};

/**
 * ⚖️ RENDRE UNE DÉCISION (CRÉATION)
 * Réservé exclusivement au Juge en charge du dossier.
 */
export const createDecision = async (payload: {
  caseId: number;
  content: string;
  verdict: string;
  date: string;
}) => {
  allow("judge");
  try {
    // 🛡️ NORMALISATION : On s'assure que la date est au format ISO et les IDs en snake_case
    const normalizedPayload = {
      case_id: payload.caseId,
      content: payload.content.trim(),
      verdict: payload.verdict,
      date: new Date(payload.date).toISOString(),
      is_signed: false // Par défaut, non signé à la création
    };

    const res = await api.post("/decisions", normalizedPayload);
    return res.data;
  } catch (error: any) {
    console.error("[DECISION SERVICE] Erreur création:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * ✍️ SIGNER ÉLECTRONIQUEMENT UNE DÉCISION
 * Une fois signée, la décision ne devrait plus être modifiable.
 */
export const signDecision = async (id: number) => {
  allow("judge");
  const res = await api.patch(`/decisions/${id}/sign`, {
    is_signed: true,
    signature_date: new Date().toISOString()
  });
  return res.data;
};

/**
 * 📝 MODIFIER UNE DÉCISION
 * Possible tant que la décision n'est pas verrouillée/signée.
 * Accepte maintenant les champs de confiscation grâce à l'interface mise à jour.
 */
export const updateDecision = async (id: number, payload: Partial<Decision>) => {
  allow("judge");
  // Utilisation de PATCH car c'est une modification partielle
  const res = await api.patch(`/decisions/${id}`, payload);
  return res.data;
};

/**
 * 🗑️ SUPPRESSION DÉFINITIVE
 */
export const deleteDecision = async (id: number) => {
  allow("admin");
  const res = await api.delete(`/decisions/${id}`);
  return res.data;
};
