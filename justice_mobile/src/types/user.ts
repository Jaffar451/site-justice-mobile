/**
 * 🎭 Rôles disponibles (Source de vérité : backend/models/user.model.ts)
 * Note : 'opj' et 'bailiff' ont été supprimés car absents de l'ENUM backend.
 * 'commisaire' est corrigé avec un seul 's' pour matcher la DB.
 */
export type UserRole = 
  | 'citizen' 
  | 'police' 
  | 'commissaire' 
  | 'judge' 
  | 'clerk' 
  | 'prosecutor' 
  | 'lawyer' 
  | 'prison_officer'
  | 'admin'
  | 'opj';

/**
 * 🏛️ Types d'organisations officiels du Niger
 */
export type OrganizationType = "POLICE" | "GENDARMERIE" | "JUSTICE" | "ADMIN" | "CITIZEN";

/**
 * 👤 Définition de l'Utilisateur alignée sur Sequelize
 */
export interface User {
  id: number;
  
  // Identité
  firstname: string;
  lastname: string;
  email: string;
  telephone: string | null;
  
  // Sécurité & Accès
  role: UserRole;
  organization: OrganizationType;
  status: "active" | "suspended" | "archived";
  isActive: boolean; // Aligné sur le champ isActive du backend
  
  // Professionnel
  matricule: string | null;
  poste: string | null; // Remplace 'grade' qui n'existe pas en DB
  
  // Rattachements (Foreign Keys)
  policeStationId: number | null;
  courtId: number | null;
  prisonId: number | null;

  // Méta-données
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 📦 Réponse de l'API lors du Login
 */
export interface AuthResponse {
  token: string;
  user: User;
}