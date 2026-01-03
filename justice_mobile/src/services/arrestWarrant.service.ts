// PATH: src/services/arrestWarrant.service.ts
import api from "./api";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * 🛡️ Vérification des habilitations
 */
const allow = (...roles: string[]) => {
  const user = useAuthStore.getState().user;
  const role = user?.role; // ✅ Correction : Accès via l'objet user
  
  if (!role || !roles.includes(role)) {
    throw new Error("Accès refusé — Action réservée aux autorités judiciaires compétentes.");
  }
};

interface CreateArrestWarrantPayload {
  caseId: number;
  personName: string;
  reason: string;
  expiresAt?: string; // Date d'expiration du mandat
  urgency: "normal" | "high" | "critical";
}

/**
 * ⚖️ Émission d'un mandat d'arrêt
 * Seul le Juge d'instruction peut ordonner l'arrestation d'un individu.
 */
export const createArrestWarrant = async (payload: CreateArrestWarrantPayload) => {
  allow("judge");
  const res = await api.post("/arrest-warrants", payload);
  return res.data;
};

/**
 * 👮 Consultation pour exécution
 * La Police et l'Admin peuvent consulter les mandats actifs pour les exécuter.
 */
export const getActiveWarrants = async () => {
  allow("police", "judge", "admin");
  const res = await api.get("/arrest-warrants/active");
  return res.data;
};

/**
 * 🛑 Annulation ou clôture d'un mandat
 * En cas d'arrestation ou de mainlevée par le juge.
 */
export const updateWarrantStatus = async (id: number, status: "executed" | "cancelled") => {
  allow("judge", "admin");
  const res = await api.patch(`/arrest-warrants/${id}/status`, { status });
  return res.data;
};