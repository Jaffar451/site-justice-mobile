/**
 * 🎭 Rôles disponibles (SYNCHRONISÉ AVEC backend/models/user.model.ts)
 * Attention : Le backend utilise 'officier_police' et 'greffier'.
 */
export type UserRole = 
  | 'admin' 
  | 'prosecutor' 
  | 'judge' 
  | 'greffier'        // backend: UserRole.CLERK = 'greffier'
  | 'commissaire' 
  | 'officier_police' // backend: UserRole.OFFICIER_POLICE = 'officier_police'
  | 'inspecteur' 
  | 'opj_gendarme'
  | 'gendarme'
  | 'prison_guard'
  | 'prison_director'
  | 'citizen' 
  | 'lawyer';

/**
 * 🏛️ Types d'organisations officiels du Niger
 */
export type OrganizationType = "POLICE" | "GENDARMERIE" | "JUSTICE" | "ADMIN" | "CITIZEN";

/**
 * 👤 Définition de l'Utilisateur alignée sur Sequelize (underscored: true)
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
  organization: string | null; // STRING en DB
  isActive: boolean; 
  
  // Professionnel
  matricule: string | null;
  district?: string | null; // Existe dans votre modèle Sequelize
  
  // Rattachements (L'interface utilise camelCase, Sequelize gère le mapping underscored)
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
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}