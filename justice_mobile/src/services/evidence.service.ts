// PATH: src/services/evidence.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";
import { Platform } from "react-native";

/**
 * ✅ INTERFACE DES PIÈCES À CONVICTION (EVIDENCE)
 */
export interface Evidence {
  id: number;
  case_id: number;
  description: string;
  type: "document" | "image" | "audio" | "video" | "other";
  file_url: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

/**
 * 🛡️ GARDE DE SÉCURITÉ
 */
const allow = (...roles: string[]) => {
  const user = useAuthStore.getState().user;
  const role = user?.role;
  
  if (!role || !roles.includes(role)) {
    const errorMsg = `Accès refusé — Le rôle '${role}' n'a pas les permissions sur les scellés/preuves.`;
    console.error(`[Security] ${errorMsg}`);
    throw new Error(errorMsg);
  }
};

/**
 * 🔹 CONSULTER LES PREUVES D'UN DOSSIER
 * Accessible à la chaîne pénale complète pour examen.
 */
export const getEvidenceByCase = async (caseId: number): Promise<Evidence[]> => {
  // Ajout du Procureur (indispensable pour l'accusation)
  allow("police", "clerk", "judge", "admin", "prosecutor");
  const res = await api.get<Evidence[]>(`/evidence/case/${caseId}`);
  return res.data;
};

/**
 * ➕ AJOUTER UNE PREUVE (Saisie de scellé numérique)
 * Principalement utilisé par l'OPJ (Police/Gendarmerie) lors de l'enquête.
 */
export const addEvidence = async (payload: {
  caseId: number;
  description: string;
  type: string;
  fileUrl: string;
}) => {
  allow("police", "admin"); // L'admin peut aider en cas d'erreur technique
  try {
    const normalizedPayload = {
      case_id: payload.caseId,
      description: payload.description.trim(),
      type: payload.type,
      file_url: payload.fileUrl
    };

    const res = await api.post("/evidence", normalizedPayload);
    return res.data;
  } catch (error: any) {
    console.error("[EVIDENCE SERVICE] Erreur ajout:", error.response?.data);
    throw error;
  }
};

/**
 * 📤 UPLOAD PHYSIQUE DE PIÈCE JOINTE
 * Supporte le Web et le Mobile pour l'envoi de fichiers vers le serveur.
 */
export const uploadEvidenceFile = async (caseId: number, file: any) => {
  allow("police", "admin", "clerk");
  
  const formData = new FormData();
  if (Platform.OS === 'web') {
    formData.append("file", file); // File object du navigateur
  } else {
    // @ts-ignore
    formData.append("file", { uri: file.uri, name: file.name, type: file.type });
  }

  const res = await api.post(`/evidence/upload/${caseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // Retourne généralement l'URL du fichier uploadé
};

/**
 * 🗑️ SUPPRESSION DE PREUVE
 * ⚠️ Action critique : Seul l'Admin peut supprimer, laissant une trace dans les logs.
 */
export const deleteEvidence = async (id: number) => {
  allow("admin");
  const res = await api.delete(`/evidence/${id}`);
  return res.data;
};
