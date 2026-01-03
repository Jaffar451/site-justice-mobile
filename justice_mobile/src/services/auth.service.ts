import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ CORRECTION : On passe par le stockage direct

// ⚠️ IMPORTANT : REMPLACEZ PAR VOTRE IP LOCALE
const API_URL = 'http://192.168.120.20:4000/api'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// ============================================================
// ✅ INTERCEPTEUR CORRIGÉ (Lit le stockage sans dépendance circulaire)
// ============================================================
api.interceptors.request.use(
  async (config) => {
    try {
      // 1. On lit le fichier de persistance de Zustand ("auth-storage")
      const json = await AsyncStorage.getItem('auth-storage');
      
      if (json) {
        const storage = JSON.parse(json);
        // 2. On extrait le token (Zustand le range dans l'objet 'state')
        const token = storage.state?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // console.log("🔑 Token injecté avec succès via AsyncStorage");
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

/**
 * Connexion utilisateur
 */
export const login = async (email: string, password: string) => {
  try {
    console.log(`📡 ENVOI LOGIN vers ${API_URL}/auth/login...`);
    const response = await api.post('/auth/login', { email, password });
    return response.data; 
  } catch (error: any) { 
    console.error("❌ ERREUR API LOGIN :", error);
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur serveur");
    } else if (error.request) {
      throw new Error("Impossible de contacter le serveur.");
    } else {
      throw new Error("Erreur de requête.");
    }
  }
};

/**
 * Inscription utilisateur
 */
export const register = async (userData: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    password: string;
}) => {
  try {
    console.log(`📡 ENVOI REGISTER vers ${API_URL}/auth/register...`);
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error("❌ ERREUR API REGISTER :", error);
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur lors de l'inscription");
    }
    throw new Error("Impossible de contacter le serveur.");
  }
};

/**
 * Récupérer le profil utilisateur
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    // On ne jette pas d'erreur ici pour ne pas bloquer l'écran, on renvoie null
    // console.log("Info: Impossible de récupérer le profil complet (token invalide ou réseau)");
    return null;
  }
};

/**
 * Mettre à jour les informations du profil
 */
export const updateProfile = async (userData: any) => {
  try {
    console.log(`📡 ENVOI UPDATE vers ${API_URL}/auth/update...`);
    const response = await api.put('/auth/update', userData);
    return response.data;
  } catch (error: any) {
    console.error("❌ ERREUR API UPDATE :", error);
    throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
  }
};

/**
 * Déconnexion
 */
export const logout = async () => {
  return;
};

export default api;