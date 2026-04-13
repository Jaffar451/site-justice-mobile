// PATH: src/services/complaint.service.ts

import api from "./api";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import OfflineService from "../utils/offlineQueue";

// ======================================================
// TYPES
// ======================================================

export type ComplaintStatus =
  | "soumise"
  | "en_cours_OPJ"
  | "attente_validation"
  | "transmise_parquet"
  | "classée_sans_suite_par_OPJ"
  | "classée_sans_suite_par_procureur"
  | "figée";

export interface Complaint {
  id: number;
  citizenId: number;
  title: string;
  description: string;
  category?: string;
  status: ComplaintStatus;
  location?: string | null;
  filedAt?: string;
  createdAt?: string;
  trackingCode?: string;

  attachments?: {
    id: number;
    file_url: string;
    filename: string;
    type?: string;
  }[];

  citizen?: {
    firstname: string;
    lastname: string;
    telephone?: string;
  };

  isOfflinePending?: boolean;
  [key: string]: any;
}

export interface PoliceStats {
  assigned: number;
  open: number;
  closed: number;
  total: number;
}

// ======================================================
// HELPERS
// ======================================================

const isOnline = async () => {
  const net = await NetInfo.fetch();
  return net.isConnected;
};

const extractData = (res: any) => res?.data?.data ?? res?.data ?? [];

// ======================================================
// READ
// ======================================================

export const getMyComplaints = async (): Promise<Complaint[]> => {
  const res = await api.get("/complaints/my-complaints");
  return extractData(res);
};

export const getAllComplaints = async (): Promise<Complaint[]> => {
  const res = await api.get("/complaints");
  return extractData(res);
};

export const getComplaintById = async (id: number): Promise<Complaint> => {
  const res = await api.get(`/complaints/${id}`);
  return extractData(res);
};

export const getStationComplaints = async (): Promise<Complaint[]> => {
  const res = await api.get("/complaints");
  return extractData(res);
};

// ======================================================
// CREATE
// ======================================================

export const createComplaint = async (data: Partial<Complaint>) => {
  if (!(await isOnline())) {
    await OfflineService.addToQueue("complaints", "create", data);

    return {
      ...data,
      id: Date.now() * -1,
      status: "soumise",
      filedAt: new Date().toISOString(),
      isOfflinePending: true,
    } as Complaint;
  }

  const res = await api.post("/complaints", data);
  return extractData(res);
};

// ======================================================
// UPDATE
// ======================================================

export const updateComplaint = async (id: number, data: Partial<Complaint>) => {
  const res = await api.patch(`/complaints/${id}`, data);
  return extractData(res);
};

// ======================================================
// ATTACHMENTS
// ======================================================

export const uploadAttachment = async (complaintId: number, file: any) => {
  if (!(await isOnline())) {
    return { message: "Upload en attente (offline)" };
  }

  const formData = new FormData();

  if (Platform.OS === "web") {
    const blob =
      file?.uri && (await fetch(file.uri).then((r) => r.blob()));

    formData.append(
      "file",
      blob || file,
      file.fileName || file.name || "upload.jpg"
    );
  } else {
    formData.append("file", {
      uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
      type: file.mimeType || file.type || "image/jpeg",
      name: file.fileName || file.name || `file_${Date.now()}.jpg`,
    } as any);
  }

  const res = await api.post(`/complaints/${complaintId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return extractData(res);
};

export const deleteAttachment = async (attachmentId: number) => {
  const res = await api.delete(`/attachments/${attachmentId}`);
  return extractData(res);
};

// ======================================================
// WORKFLOW (CRITIQUE)
// aligné backend ComplaintService.transition()
// ======================================================

export const transitionComplaint = async (
  id: number,
  status: ComplaintStatus,
  reason?: string
) => {
  const res = await api.post(`/complaints/${id}/transition`, {
    status,
    reason,
  });

  return extractData(res);
};

// ======================================================
// ACTIONS MÉTIER SIMPLIFIÉES
// ======================================================

export const submitToOPJ = (id: number) =>
  transitionComplaint(id, "en_cours_OPJ");

export const sendToParquet = (id: number) =>
  transitionComplaint(id, "transmise_parquet");

export const closeWithoutOPJ = (id: number, reason: string) =>
  transitionComplaint(id, "classée_sans_suite_par_OPJ", reason);

export const closeWithoutProsecutor = (id: number, reason: string) =>
  transitionComplaint(id, "classée_sans_suite_par_procureur", reason);

export const archiveCase = (id: number) =>
  transitionComplaint(id, "figée");

// ======================================================
// AVAILABLE TRANSITIONS
// ======================================================

export const getAvailableTransitions = async (
  id: number
): Promise<ComplaintStatus[]> => {
  const res = await api.get(`/complaints/${id}/transitions`);
  return extractData(res);
};

// ======================================================
// STATISTICS
// ======================================================

export const getPoliceStats = async (): Promise<PoliceStats> => {
  try {
    const res = await api.get("/complaints");
    const data: Complaint[] = extractData(res);

    return {
      total: data.length,
      assigned: data.filter((c) => c.status === "en_cours_OPJ").length,
      open: data.filter((c) =>
        ["soumise", "attente_validation"].includes(c.status)
      ).length,
      closed: data.filter((c) =>
        ["figée", "classée_sans_suite_par_OPJ", "classée_sans_suite_par_procureur"].includes(
          c.status
        )
      ).length,
    };
  } catch {
    return { total: 0, assigned: 0, open: 0, closed: 0 };
  }
};

// ======================================================
// COMPATIBILITY ALIASES
// ======================================================

export const getComplaint = getComplaintById;
export const getMyComplaintsList = getMyComplaints;
