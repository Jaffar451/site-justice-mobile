import api from "./api";

export type UserRole =
  | "citizen"
  | "officier_police"
  | "gendarme"
  | "commissaire"
  | "judge"
  | "prosecutor"
  | "greffier"
  | "lawyer"
  | "prison_guard"
  | "prison_director"
  | "inspecteur"
  | "opj_gendarme"
  | "admin";

export type OrganizationType = "POLICE" | "GENDARMERIE" | "JUSTICE" | "ADMIN" | "CITIZEN";
export type UserStatus = "active" | "suspended" | "archived";

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  organization: OrganizationType;
  matricule: string | null;
  registrationNumber: string;
  poste: string | null;
  telephone: string | null;
  status: UserStatus;
  isActive: boolean;
  policeStationId?: number | null;
  courtId?: number | null;
  prisonId?: number | null;
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserData = User;

export type CreateUserPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role: UserRole;
  organization: OrganizationType;
  matricule?: string;
  telephone?: string;
  poste?: string;
  policeStationId?: number | null;
  courtId?: number | null;
  prisonId?: number | null;
};

export type UpdateProfilePayload = Partial<Omit<User, "id" | "role" | "organization" | "email">>;

// ─── Helper pour unwrapper les réponses API ────────────────────────────────
const unwrap = <T>(res: any): T => res.data?.data || res.data;

// ─── ME ───────────────────────────────────────────────────────────────────
export const getMe = async (): Promise<User> => {
  const res = await api.get<any>("/users/me");
  return unwrap<User>(res);
};

export const updateMe = async (payload: UpdateProfilePayload): Promise<User> => {
  const res = await api.patch<any>("/users/me", payload);
  return unwrap<User>(res);
};

// ─── ADMIN ────────────────────────────────────────────────────────────────
export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get<any>("/users");
  return unwrap<User[]>(res) || [];
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get<any>(`/users/${id}`);
  return unwrap<User>(res);
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await api.post<any>("/users", payload);
  return unwrap<User>(res);
};

export const updateUser = async (id: number, payload: Partial<User>): Promise<User> => {
  const res = await api.patch<any>(`/users/${id}`, payload);
  return unwrap<User>(res);
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updatePushToken = async (pushToken: string): Promise<void> => {
  await api.patch("/users/push-token", { pushToken });
};

// ─── COMMISSAIRE / CHEF D'UNITÉ ───────────────────────────────────────────
/**
 * ✅ Récupère les agents d'une unité (commissariat/gendarmerie)
 * Gère le cas où l'endpoint n'existe pas encore (404) ou accès refusé (403)
 * Retourne un tableau vide en cas d'erreur autorisée
 */
export const getMyUnitStaff = async (stationId?: number): Promise<User[]> => {
  if (!stationId) {
    console.warn("[UserService] stationId manquant pour getMyUnitStaff");
    return [];
  }
  
  try {
    const res = await api.get<any>(`/users/by-station/${stationId}`);
    return unwrap<User[]>(res) || [];
  } catch (error: any) {
    // Gère silencieusement les erreurs 403 (pas les droits) ou 404 (endpoint inexistant)
    if (error.response?.status === 403 || error.response?.status === 404) {
      console.warn(`[UserService] Accès unité ${stationId} refusé ou endpoint non disponible`);
      return [];
    }
    throw error;
  }
};
