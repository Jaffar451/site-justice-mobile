// PATH: src/theme/index.ts
import { useAuthStore } from '../stores/useAuthStore';

// ✅ Export de tous les tokens de design
export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./radius";
export * from "./shadows";
export * from "./light";
export * from "./dark";
export * from "./AppThemeProvider";

// 🎨 Palette spécifique pour les rôles (Codes couleurs officiels)
const ROLE_PALETTE = {
  indigo: '#6366F1',   // Admin
  blue: '#2563EB',     // Police
  darkBlue: '#1E40AF', // Gendarmerie
  emerald: '#059669',  // Justice (Siège/Parquet)
  slate: '#475569',    // Greffe / Auxiliaire
  cyan: '#0891B2',     // Citoyen
};

/**
 * 🪄 Fonction Helper qui détermine le thème en fonction du Rôle actif
 * Accessible partout (même hors des composants React, ex: dans les Guards ou Services)
 */
export const getAppTheme = () => {
  // On récupère l'état actuel du store sans s'abonner aux changements
  const { role, user } = useAuthStore.getState();
  const org = user?.organization;

  // 1. ADMIN
  if (role === 'admin') {
    return { color: ROLE_PALETTE.indigo, label: 'ADMINISTRATION' };
  }

  // 2. FORCES DE L'ORDRE (Police vs Gendarmerie)
  if (role === 'police' || role === 'commissaire') {
    return org === 'GENDARMERIE' 
      ? { color: ROLE_PALETTE.darkBlue, label: 'GENDARMERIE NATIONALE' }
      : { color: ROLE_PALETTE.blue, label: 'POLICE NATIONALE' };
  }

  // 3. JUSTICE (Siège & Parquet)
  if (role === 'judge' || role === 'prosecutor') {
    return { color: ROLE_PALETTE.emerald, label: 'AUTORITÉ JUDICIAIRE' };
  }

  // 4. GREFFE & AUXILIAIRES
  if (role === 'clerk' || role === 'lawyer' || role === 'prison_officer') {
    return { color: ROLE_PALETTE.slate, label: 'GREFFE & AUXILIAIRES' };
  }

  // 5. PAR DÉFAUT : CITOYEN
  return { color: ROLE_PALETTE.cyan, label: 'ESPACE CITOYEN' };
};