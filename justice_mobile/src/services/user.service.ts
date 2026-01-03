import api from "./api";

/**
 * 🏛️ TYPES STRICTEMENT ALIGNÉS (Source: user.model.ts)
 */

export type UserRole =
  | "citizen"
  | "police"
  | "gendarme(OPJ)"
  | "commissaire" 
  | "judge" 
  | "prosecutor" 
  | "clerk" 
  | "lawyer" 
  | "prison_officer"
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
  
  // Relations de tutelle
  policeStationId?: number | null; 
  courtId?: number | null;         
  prisonId?: number | null; 

  createdAt?: string;
  updatedAt?: string;
}

// Alias pour la compatibilité avec tes anciens imports
export type UserData = User;

/**
 * 📦 PAYLOADS
 */

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

/**
 * 👤 SERVICES UTILISATEUR (ME)
 */

export const getMe = async (): Promise<User> => {
  const res = await api.get<User>("/users/me");
  return res.data;
};

export const updateMe = async (payload: UpdateProfilePayload): Promise<User> => {
  const res = await api.patch<User>("/users/me", payload);
  return res.data;
};

/**
 * 🔑 SERVICES ADMINISTRATION (ADMIN ONLY)
 */

export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/users");
  return res.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await api.post<User>("/users", payload);
  return res.data;
};

export const updateUser = async (id: number, payload: Partial<User>): Promise<User> => {
  const res = await api.patch<User>(`/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};