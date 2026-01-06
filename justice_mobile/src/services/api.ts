// PATH: src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureGet } from '../utils/secureStorage';
import { useAuthStore } from '../stores/useAuthStore';
import { ENV } from '../config/env'; // ✅ On importe la config corrigée

// ==========================================
// 🚀 CRÉATION DE L'INSTANCE AXIOS
// ==========================================
const api = axios.create({
  // ✅ On utilise directement l'URL de env.ts (qui est déjà correcte)
  // Pas de `${ENV.API_URL}/api` ici, sinon ça ferait doublon !
  baseURL: ENV.API_URL, 
  timeout: ENV.TIMEOUT, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * 📤 INTERCEPTEUR DE REQUÊTE (REQUEST)
 * Injecte le token et loggue l'URL pour vérifier qu'elle est bonne.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. Récupération du token
    const token = await secureGet('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. 🔍 Log de l'URL complète pour le débogage
    // Tu devrais voir : [API] ➡️ GET https://site-justice-mobile.onrender.com/api/complaints/my-complaints
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
 * Gestion centralisée des erreurs.
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // CAS 1 : Session expirée (401)
    if (error.response?.status === 401) {
      console.warn("[API] ⛔ Session expirée (401). Déconnexion...");
      useAuthStore.getState().logout();
      return Promise.reject(new Error("Votre session a expiré. Veuillez vous reconnecter."));
    }

    // CAS 2 : Accès interdit (403)
    if (error.response?.status === 403) {
        console.warn("[API] ⛔ Accès interdit (403).");
        return Promise.reject(new Error("Droits insuffisants pour cette action."));
    }

    // CAS 3 : Problème Réseau
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.error(`[API] ⚠️ Erreur Réseau vers : ${originalRequest?.baseURL}`);
      return Promise.reject(new Error("Impossible de contacter le serveur. Vérifiez votre connexion."));
    }

    // CAS 4 : Erreur Serveur (500)
    if (error.response?.status && error.response.status >= 500) {
      console.error(`[API] 🔥 Erreur Serveur ${error.response.status}`);
      return Promise.reject(new Error("Erreur temporaire du serveur. Réessayez plus tard."));
    }

    return Promise.reject(error);
  }
);

export default api;