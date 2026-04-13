import axios from "axios";
import { ENV } from "../config/env"; 
import { 
  saveTokens, 
  secureGet, 
  STORAGE_KEYS, 
  clearStorage 
} from "../utils/secureStorage";

/**
 * 🔄 Fonction de rafraîchissement du Token
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refresh = await secureGet(STORAGE_KEYS.REFRESH);
    
    if (!refresh) {
      console.warn("[AUTH] Aucun Refresh Token trouvé.");
      return null;
    }

    const res = await axios.post(`${ENV.API_URL}/auth/refresh`, { 
      refreshToken: refresh 
    }, {
      timeout: 10000 
    });

    const { token: newToken, refreshToken: newRefresh, user } = res.data;

    if (!newToken) {
      throw new Error("Réponse serveur incomplète : token manquant.");
    }

    // Sauvegarde des nouveaux jetons
    await saveTokens(newToken, newRefresh || refresh);

    // Mise à jour dynamique du Store Zustand
    // On utilise require pour éviter les dépendances circulaires
    const { useAuthStore } = require("../stores/useAuthStore");
    
    // Correction : mise à jour des propriétés réelles de votre store
    useAuthStore.setState({ 
      user: user || useAuthStore.getState().user,
      isAuthenticated: true 
    });

    console.log("[AUTH] Rafraîchissement du jeton réussi.");
    return newToken;

  } catch (err: any) {
    console.error("[AUTH] Échec du rafraîchissement :", err.message);

    if (err.response?.status === 401 || err.response?.status === 403) {
      const { useAuthStore } = require("../stores/useAuthStore");
      const refreshToken = await secureGet(STORAGE_KEYS.REFRESH);
      
      await clearStorage();
      // Correction : Appel conforme à la nouvelle signature de logout
      await useAuthStore.getState().logout(refreshToken || '');
      
      console.warn("[AUTH] Session expirée. Redirection vers la connexion.");
    }
    
    return null;
  }
}