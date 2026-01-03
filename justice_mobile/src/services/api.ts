import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native'; 
import { secureGet } from '../utils/secureStorage';
import { useAuthStore } from '../stores/useAuthStore';

// ==========================================
// 🔧 CONFIGURATION RÉSEAU
// ==========================================

// ✅ IP Locale (votre configuration actuelle)
const LOCAL_IP = '192.168.120.20'; 
const PORT = '4000';

/**
 * 📍 Détermine l'URL de l'API selon la plateforme
 */
const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}/api`;
  }
  // Pour Android (Émulateur ou Physique) et iOS
  return `http://${LOCAL_IP}:${PORT}/api`;
};

// ✅ AJOUT CRITIQUE : On exporte cette constante pour l'utiliser dans les écrans (images)
export const API_URL = getBaseUrl();

// ==========================================
// 🚀 CRÉATION DE L'INSTANCE AXIOS
// ==========================================
const api = axios.create({
  baseURL: API_URL, // On utilise la constante exportée
  timeout: 15000, // 15 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * 📤 INTERCEPTEUR DE REQUÊTE (REQUEST)
 * Injecte le token automatiquement et loggue l'URL complète.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Récupération du token sécurisé
    const token = await secureGet('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔍 Log pour débugger
    const fullUrl = `${config.baseURL || ''}${config.url}`;
    console.log(`[API] ➡️  ${config.method?.toUpperCase()} ${fullUrl}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 📥 INTERCEPTEUR DE RÉPONSE (RESPONSE)
 * Gère les erreurs globales (401, Réseau, 500).
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // CAS 1 : Erreur 401 (Non autorisé / Token expiré)
    if (error.response?.status === 401) {
      console.warn("[API] ⛔ Session expirée (401). Déconnexion forcée.");
      useAuthStore.getState().logout();
      return Promise.reject(new Error("Votre session a expiré. Veuillez vous reconnecter."));
    }

    // CAS 2 : Erreur 403 (Interdit - Token présent mais droits insuffisants)
    if (error.response?.status === 403) {
        console.warn("[API] ⛔ Accès interdit (403).");
        return Promise.reject(new Error("Vous n'avez pas les droits pour accéder à cette ressource."));
    }

    // CAS 3 : Erreur Réseau (Network Error / Connection Refused)
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.error(`[API] ⚠️ Problème de réseau vers : ${originalRequest?.baseURL}`);
      return Promise.reject(new Error(`Impossible de contacter le serveur (${originalRequest?.baseURL}). Vérifiez votre connexion.`));
    }

    // CAS 4 : Erreurs Serveur (500)
    if (error.response?.status && error.response.status >= 500) {
      console.error(`[API] 🔥 Erreur Serveur ${error.response.status}`);
      return Promise.reject(new Error("Erreur interne du serveur. Réessayez plus tard."));
    }

    return Promise.reject(error);
  }
);

export default api;