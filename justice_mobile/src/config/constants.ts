// src/config/constants.ts

// ✅ Utilise ENV qui détecte l'IP automatiquement
import { ENV } from './env';

export const API_URL = ENV.API_URL;

// Autres constantes globales
export const APP_NAME = 'E-Justice Niger';
export const APP_VERSION = ENV.VERSION;
export const REQUEST_TIMEOUT = ENV.TIMEOUT;

// Endpoints spécifiques (optionnel)
export const ENDPOINTS = {
  AUTH: `${API_URL}/auth`,
  USERS: `${API_URL}/users`,
  CASES: `${API_URL}/cases`,
  DOCUMENTS: `${API_URL}/documents`,
} as const;
