// PATH: src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureGet } from '../utils/secureStorage';
import { useAuthStore } from '../stores/useAuthStore';
import { ENV } from '../config/env';

/**
 * 🚀 INSTANCE AXIOS CONFIGURÉE
 */
const api = axios.create({
  baseURL: ENV.API_URL, 
  timeout: ENV.TIMEOUT, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * 📤 INTERCEPTEUR DE REQUÊTE
 * Modifié pour être plus réactif au changement de session
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. Récupération prioritaire depuis le Store (Mémoire vive)
    // C'est crucial pour les appels qui suivent immédiatement le Login
    let token = useAuthStore.getState().token;

    // 2. Fallback sur le stockage sécurisé (Disque) si le store n'est pas encore hydraté
    if (!token) {
      token = await secureGet('token');
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging détaillé
    const fullUrl = `${config.baseURL || ''}${config.url}`;
    console.log(`[API] ➡️ ${config.method?.toUpperCase()} ${fullUrl}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 📥 INTERCEPTEUR DE RÉPONSE
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const backendMessage = (error.response?.data as any)?.message;
    const status = error.response?.status;

    // CAS 1 : Session expirée (401)
    if (status === 401) {
      console.warn("[API] ⛔ Session expirée (401). Déconnexion...");
      useAuthStore.getState().logout();
      return Promise.reject(new Error(backendMessage || "Votre session a expiré."));
    }

    // CAS 2 : Accès interdit (403)
    if (status === 403) {
      console.warn("[API] ⛔ Accès interdit (403). Vérifiez les permissions du rôle.");
      return Promise.reject(new Error(backendMessage || "Droits insuffisants."));
    }

    // CAS 3 : Réseau / Timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      return Promise.reject(new Error("Serveur injoignable."));
    }

    // CAS 4 : Validation (400)
    if (status === 400) {
      return Promise.reject(new Error(backendMessage || "Données invalides."));
    }

    // CAS 5 : Erreur Serveur (500)
    if (status && status >= 500) {
      return Promise.reject(new Error("Erreur technique sur le serveur e-Justice."));
    }

    return Promise.reject(error);
  }
);

export default api;