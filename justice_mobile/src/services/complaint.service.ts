import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";
import NetInfo from '@react-native-community/netinfo';
import { Platform } from "react-native";
import OfflineService from '../utils/offlineQueue'; 

// ==========================================
// 🛡️ CONFIGURATION & TYPES
// ==========================================

const ROLES = {
  ADMIN: "admin",
  CLERK: "greffier",        // ✅ Mis à jour (était clerk)
  JUDGE: "judge",
  PROSECUTOR: "prosecutor",
  COMMISSAIRE: "commissaire", 
  POLICE: "officier_police", // ✅ Mis à jour (était police)
  CITIZEN: "citizen",
} as const;

export type ComplaintStatus =
  | "soumise" | "en_cours_OPJ" | "attente_validation" | "transmise_parquet" 
  | "saisi_juge" | "instruction" | "audience_programmée" | "jugée" 
  | "non_lieu" | "ordonnance_rendue" | "classée_sans_suite" | "archivée";

export interface Complaint {
  id: number;
  citizenId: number;
  title: string;
  description: string;
  category?: string;
  status: ComplaintStatus;
  location?: string | null;
  filedAt: string;
  trackingCode?: string;
  attachments?: { id: number; file_url: string; filename: string; type?: string }[];
  citizen?: { firstname: string; lastname: string; telephone?: string };
  isOfflinePending?: boolean;
  // Autres champs optionnels...
  [key: string]: any; 
}

export interface PoliceStats {
  assigned: number;
  open: number;
  closed: number;
}

const allow = (...authorizedRoles: string[]) => {
  const user = useAuthStore.getState().user;
  // On compare avec les rôles du backend (en minuscules)
  if (!user?.role || !authorizedRoles.includes(user.role)) {
    console.warn(`Accès restreint : ${user?.role}`);
  }
};

// ==========================================
// 📋 LECTURE
// ==========================================

export const getMyComplaints = async () => {
  const res = await api.get<any>("/complaints/my-complaints");
  return res.data.data || [];
};

export const getAllComplaints = async () => {
  // ✅ Désormais, ROLES.POLICE vaut "officier_police", l'accès sera autorisé
  allow(ROLES.POLICE, ROLES.COMMISSAIRE, ROLES.PROSECUTOR, ROLES.CLERK, ROLES.JUDGE, ROLES.ADMIN);
  const res = await api.get<any>("/complaints");
  return res.data.data || [];
};

export const getComplaintById = async (id: number) => {
  const res = await api.get<any>(`/complaints/${id}`);
  return res.data.data;
};

// ==========================================
// ✍️ ÉCRITURE & UPLOAD (CORRIGÉ WEB/MOBILE)
// ==========================================

export const createComplaint = async (data: Partial<Complaint>) => {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    await OfflineService.addToQueue('complaints', 'create', data);
    return { ...data, id: Date.now() * -1, status: 'soumise', filedAt: new Date().toISOString(), isOfflinePending: true } as Complaint;
  }
  const res = await api.post<any>("/complaints", data);
  return res.data.data;
};

export const updateComplaint = async (id: number, data: Partial<Complaint>) => {
  const res = await api.patch<any>(`/complaints/${id}`, data);
  return res.data.data;
};

/**
 * ✅ FONCTION D'UPLOAD ROBUSTE (WEB & MOBILE)
 */
export const uploadAttachment = async (complaintId: number, file: any) => {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return { message: "Mis en attente (Upload indisponible hors-ligne)" };

  const formData = new FormData();

  if (Platform.OS === 'web') {
    // 🌐 WEB : Conversion obligatoire de l'URI en Blob
    if (file.uri) {
        try {
            const fetchResponse = await fetch(file.uri);
            const blob = await fetchResponse.blob();
            formData.append("file", blob, file.fileName || file.name || "image.jpg");
        } catch (e) {
            console.error("Erreur conversion Blob:", e);
            throw new Error("Impossible de lire le fichier pour l'upload");
        }
    } else {
        // Cas où c'est déjà un objet File standard
        formData.append("file", file);
    }
  } else {
    // 📱 MOBILE (iOS / Android) : Objet JSON spécifique pour React Native
    const fileToUpload = {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      type: file.mimeType || file.type || 'image/jpeg',
      name: file.fileName || file.name || `photo_${Date.now()}.jpg`,
    };
    // @ts-ignore
    formData.append("file", fileToUpload);
  }

  // Envoi de la requête
  return (await api.post(`/complaints/${complaintId}/attachments`, formData, {
    headers: {
      'Accept': 'application/json',
      // ⚠️ IMPORTANT : Ne jamais mettre 'Content-Type': 'multipart/form-data' manuellement ici
    },
    transformRequest: (data) => data, // Empêche Axios de transformer le FormData en JSON
  })).data;
};

export const deleteAttachment = async (attachmentId: number) => {
  const res = await api.delete(`/attachments/${attachmentId}`);
  return res.data;
};

// ==========================================
// ⚖️ WORKFLOW & ACTIONS
// ==========================================

export const submitToCommissaire = async (id: number) => {
  allow(ROLES.POLICE);
  return (await api.patch<Complaint>(`/complaints/${id}/submit-review`)).data;
};

export const validateToParquet = async (id: number) => {
  allow(ROLES.COMMISSAIRE);
  return (await api.patch<Complaint>(`/complaints/${id}/to-parquet`)).data;
};

export const assignToJudge = async (id: number, assignedJudgeId: number) => {
  allow(ROLES.PROSECUTOR);
  return (await api.patch<Complaint>(`/complaints/${id}/assign-judge`, { assignedJudgeId })).data;
};

export const updateComplaintStatus = async (id: number, status: ComplaintStatus | string, extraData?: any) => {
    const payload = typeof extraData === 'object' ? { status, ...extraData } : { status, notes: extraData };
    const response = await api.patch(`/complaints/${id}/status`, payload);
    return response.data;
};

export const finalizeVerdict = async (id: number, verdictDetails: string, isGuilty: boolean) => {
  allow(ROLES.JUDGE);
  const status = isGuilty ? "jugée" : "non_lieu";
  return (await api.patch(`/complaints/${id}/verdict`, { status, verdictDetails })).data;
};

export const closeWithoutProsecution = async (id: number, reason: string) => {
  allow(ROLES.PROSECUTOR);
  return (await api.patch(`/complaints/${id}/close`, { reason })).data;
};

// Alias
export const getComplaint = getComplaintById;
export const getMyComplaintsList = getMyComplaints;

export const getStationComplaints = async () => {
    const res = await api.get<any>("/complaints/station");
    return res.data.data || [];
}

export const getPoliceStats = async (): Promise<PoliceStats> => {
    return new Promise((resolve) => setTimeout(() => resolve({ assigned: 12, open: 5, closed: 34 }), 500));
};