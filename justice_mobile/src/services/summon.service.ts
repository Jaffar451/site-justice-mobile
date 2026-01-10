// PATH: src/services/summon.service.ts
import api from "./api";

// ⚖️ Définition des types pour la cohérence judiciaire
export type SummonStatus = "émis" | "notifié" | "honoré" | "absent" | "annulé";

export interface Summon {
  id?: number;
  complaintId: number;
  targetName: string;
  targetPhone: string;
  location: string;
  scheduledAt: string; // ISO String
  reason: string;
  status?: SummonStatus;
  createdAt?: string;
}

/**
 * 📝 Créer une nouvelle convocation officielle
 */
export const createSummon = async (data: Summon) => {
  const res = await api.post<any>("/summons", data);
  // Le backend devrait idéalement retourner l'objet créé avec son ID
  return res.data.data || res.data;
};

/**
 * 📂 Récupérer toutes les convocations liées à un dossier (RG)
 */
export const getSummonsByComplaint = async (complaintId: number) => {
  const res = await api.get<any>(`/summons/complaint/${complaintId}`);
  return res.data.data || res.data || [];
};

/**
 * 🔄 Mettre à jour le statut (ex: passage de 'émis' à 'honoré' lors de l'arrivée au poste)
 */
export const updateSummonStatus = async (id: number, status: SummonStatus) => {
  const res = await api.patch<any>(`/summons/${id}/status`, { status });
  return res.data.data || res.data;
};

/**
 * 📄 (Optionnel) Récupérer le lien vers la convocation signée (PDF)
 */
export const getSummonPdfUrl = (id: number) => {
  return `${api.defaults.baseURL}/summons/${id}/pdf`;
};