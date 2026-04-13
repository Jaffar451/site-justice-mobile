import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { secureGet, secureSet, secureDelete } from '../utils/secureStorage';

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
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureGet('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[API] ➡️ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 📥 INTERCEPTEUR DE RÉPONSE
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn("[API] ⛔ Session expirée.");
    }
    return Promise.reject(error);
  }
);

export const saveAuthData = async (token: string, user: any, refreshToken?: string) => {
  await secureSet('token', token);
  await secureSet('user', JSON.stringify(user));
  if (refreshToken) await secureSet('refreshToken', refreshToken);
};

// CORRECTION : La fonction accepte maintenant un objet contenant le token
export const logoutFromApi = async (data: { refresh: string }) => {
  // Vérification de sécurité pour éviter d'envoyer un objet corrompu
  if (typeof data.refresh !== 'string') {
    console.error("[API] Le token de rafraîchissement doit être une chaîne de caractères");
    return;
  }

  try { 
    return await api.post('/auth/logout', data); 
  } catch (error) {
    throw error;
  } finally {
    await secureDelete('token');
    await secureDelete('user');
    await secureDelete('refreshToken');
  }
};

export const isAuthenticated = async () => !!(await secureGet('token'));

export default api;