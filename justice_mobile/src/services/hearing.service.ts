// PATH: src/services/hearing.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";
import { format } from "date-fns"; // Assurez-vous d'avoir date-fns, sinon on utilisera une méthode native

/**
 * ✅ INTERFACE DE L'AUDIENCE (HEARING)
 * Synchronisée avec l'interface UI et le Backend
 */
export interface Hearing {
  id: number;
  caseId: number;
  caseNumber: string;         // Ex: "RP-2023-0458"
  date: string;               // ISO 8601 (ex: 2025-12-25T09:00:00Z)
  time?: string;              // Format "HH:mm" (Calculé ou fourni)
  room: string;               // Ex: "Salle 1", "Chambre du Conseil"
  
  // On autorise les string pour la flexibilité (ex: "Première Comparution") 
  // tout en gardant les clés techniques
  type: "preliminary" | "trial" | "verdict" | string; 
  
  status: "scheduled" | "adjourned" | "completed" | "cancelled";
  
  // ✅ AJOUT POUR L'AFFICHAGE (Avocats/Juges)
  parties?: string;           // Ex: "Ministère Public C/ M. Sani"

  judgeName?: string;         // Nom du juge président (pour l'affichage)
  notes?: string;             // Observations du Greffier
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 🛡️ GARDE DE SÉCURITÉ CLIENT
 * Vérifie les rôles avant d'émettre la requête
 */
const allow = (...authorizedRoles: string[]) => {
  const user = useAuthStore.getState().user;
  const role = user?.role;
  
  // Si pas de user (déconnecté) ou rôle non autorisé
  if (!role || !authorizedRoles.includes(role)) {
    // Note: En prod, on peut juste retourner false ou throw une erreur silencieuse
    const errorMsg = `Accès refusé — Le rôle '${role || "inconnu"}' n'est pas autorisé.`;
    console.warn(`[Security] ${errorMsg}`);
    // On ne throw pas forcément pour ne pas crasher l'app, mais on bloque l'appel API ci-dessous
    throw new Error(errorMsg);
  }
};

/**
 * 🔧 Utilitaire : Formater les données reçues (si nécessaire)
 * Extrait l'heure de la date ISO si le backend ne l'envoie pas
 */
const formatHearingData = (hearing: Hearing): Hearing => {
  if (!hearing.time && hearing.date) {
    const d = new Date(hearing.date);
    // Extraction simple de l'heure HH:mm
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    hearing.time = `${hours}:${minutes}`;
  }
  return hearing;
};

/**
 * 🔹 RÉCUPÉRER TOUT LE RÔLE D'AUDIENCE
 * Utilisé par le Greffe pour la gestion quotidienne
 */
export const getAllHearings = async (): Promise<Hearing[]> => {
  // ✅ Ajout de "lawyer" pour l'agenda avocat
  allow("police", "clerk", "judge", "admin", "prosecutor", "lawyer");
  
  try {
    const res = await api.get<Hearing[]>("/hearings");
    const data = Array.isArray(res.data) ? res.data : [];
    
    // Enrichissement des données pour l'UI
    return data.map(formatHearingData);
  } catch (error) {
    console.error("[HEARING] Erreur fetch all:", error);
    return []; // Retourne tableau vide en cas d'erreur pour éviter crash UI
  }
};

/**
 * 🔹 AUDIENCES LIÉES À UN DOSSIER SPÉCIFIQUE
 */
export const getHearingsByCase = async (caseId: number): Promise<Hearing[]> => {
  // ✅ Ajout de "lawyer" ici aussi
  allow("clerk", "judge", "admin", "prosecutor", "citizen", "lawyer");
  
  try {
    const res = await api.get<Hearing[]>(`/hearings/case/${caseId}`);
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(formatHearingData);
  } catch (error) {
    return [];
  }
};

/**
 * ➕ PROGRAMMER UNE AUDIENCE (ENRÔLEMENT)
 */
export const createHearing = async (payload: {
  caseId: number;
  caseNumber: string;
  date: string;
  room: string;
  type: string;
  judgeName?: string;
}) => {
  allow("clerk", "admin"); // Seuls les greffiers programment
  try {
    const normalizedPayload = {
      case_id: payload.caseId,
      case_number: payload.caseNumber,
      date: new Date(payload.date).toISOString(), // Assure le format ISO
      room: payload.room.trim(),
      type: payload.type,
      judge_name: payload.judgeName,
      status: "scheduled"
    };

    const res = await api.post("/hearings", normalizedPayload);
    return res.data;
  } catch (error: any) {
    console.error("[HEARING SERVICE] Erreur programmation:", error.response?.data);
    throw error;
  }
};

/**
 * 📝 MODIFIER UNE AUDIENCE (REPORT / RENVOI / RÉSULTAT)
 */
export const updateHearing = async (id: number, payload: Partial<Hearing>) => {
  allow("clerk", "admin", "judge");
  try {
    const updateData: any = { ...payload };
    
    // Si on met à jour la date, on s'assure qu'elle est ISO
    if (updateData.date) {
      updateData.date = new Date(updateData.date).toISOString();
    }

    const res = await api.patch(`/hearings/${id}`, updateData); // PATCH souvent préféré à PUT pour partiel
    return res.data;
  } catch (error: any) {
    console.error(`[HEARING SERVICE] Erreur update ${id}:`, error.response?.data);
    throw error;
  }
};

/**
 * 🗑️ SUPPRESSION
 */
export const deleteHearing = async (id: number) => {
  allow("admin", "clerk"); // Le greffier peut annuler une programmation erronée
  const res = await api.delete(`/hearings/${id}`);
  return res.data;
};