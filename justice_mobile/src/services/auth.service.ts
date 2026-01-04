import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ✅ IMPORT IMPORTANT : On récupère la config qu'on a faite dans env.ts
// (Ajuste le chemin '../config/env' si ton dossier est structuré différemment)
import { ENV } from '../config/env'; 

// ❌ ON SUPPRIME LA LIGNE QUI FORÇAIT L'IP LOCALE
// const API_URL = 'http://192.168.120.20:4000/api'; 

// ✅ ON UTILISE L'URL DYNAMIQUE DE NOTRE CONFIG
console.log("🔗 API URL utilisée :", ENV.API_URL); // Log pour vérifier

export const api = axios.create({
  baseURL: ENV.API_URL, // <--- C'est ici que la magie opère (Render)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ENV.TIMEOUT || 30000, // On utilise le timeout de la config
});

// ============================================================
// ✅ INTERCEPTEUR (Ton code était bon ici)
// ============================================================
api.interceptors.request.use(
  async (config) => {
    try {
      const json = await AsyncStorage.getItem('auth-storage');
      if (json) {
        const storage = JSON.parse(json);
        const token = storage.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn("Erreur lecture token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- FONCTIONS D'AUTHENTIFICATION ---

export const login = async (email: string, password: string) => {
  try {
    // On utilise api.getUri() pour voir l'URL complète dans les logs
    console.log(`📡 ENVOI LOGIN vers ${ENV.API_URL}/auth/login...`);
    const response = await api.post('/auth/login', { email, password });
    return response.data; 
  } catch (error: any) { 
    console.error("❌ ERREUR API LOGIN :", error.message);
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur serveur");
    } else if (error.request) {
      throw new Error("Impossible de contacter le serveur (Vérifiez votre internet).");
    } else {
      throw new Error("Erreur de requête.");
    }
  }
};

export const register = async (userData: any) => {
  try {
    console.log(`📡 ENVOI REGISTER vers ${ENV.API_URL}/auth/register...`);
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error("❌ ERREUR API REGISTER :", error.message);
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur lors de l'inscription");
    }
    throw new Error("Impossible de contacter le serveur.");
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    return null;
  }
};

export const updateProfile = async (userData: any) => {
  try {
    console.log(`📡 ENVOI UPDATE vers ${ENV.API_URL}/auth/update...`);
    const response = await api.put('/auth/update', userData);
    return response.data;
  } catch (error: any) {
    console.error("❌ ERREUR API UPDATE :", error);
    throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
  }
};

export const logout = async () => {
  return;
};

export default api;