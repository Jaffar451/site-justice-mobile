import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native'; 
import { secureGet } from '../utils/secureStorage';
import { useAuthStore } from '../stores/useAuthStore';

// ==========================================
// 🔧 CONFIGURATION RÉSEAU (CLOUD RENDER)
// ==========================================

// ✅ L'adresse officielle de votre serveur sur Internet
const SERVER_URL = 'https://site-justice-mobile.onrender.com';

// ✅ L'URL complète de l'API (ex: https://.../api)
// On exporte cette constante pour l'utiliser ailleurs si besoin (images, etc.)
export const API_URL = `${SERVER_URL}/api`;

// ==========================================
// 🚀 CRÉATION DE L'INSTANCE AXIOS
// ==========================================
const api = axios.create({
  baseURL: API_URL, 
  timeout: 30000, // ⏳ Augmenté à 30 sec (les serveurs gratuits peuvent être lents au réveil)
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

    // 🔍 Log pour débugger (Vous verrez l'adresse Render ici)
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
      return Promise.reject(new Error("Impossible de contacter le serveur. Vérifiez votre connexion internet."));
    }

    // CAS 4 : Erreurs Serveur (500)
    if (error.response?.status && error.response.status >= 500) {
      console.error(`[API] 🔥 Erreur Serveur ${error.response.status}`);
      return Promise.reject(new Error("Le serveur rencontre un problème momentané. Réessayez plus tard."));
    }

    return Promise.reject(error);
  }
);

export default api;