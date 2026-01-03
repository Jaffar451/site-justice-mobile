import axios from "axios";
// ✅ Import de ENV désormais conforme à l'export nommé du fichier config
import { ENV } from "../config/env"; 
import { 
  saveTokens, 
  secureGet, 
  STORAGE_KEYS, 
  clearStorage 
} from "../utils/secureStorage";

/**
 * 🔄 Fonction de rafraîchissement du Token
 * Interroge le serveur central e-Justice Niger pour obtenir un nouveau couple de jetons.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refresh = await secureGet(STORAGE_KEYS.REFRESH);
    
    if (!refresh) {
      console.warn("[AUTH] Aucun Refresh Token trouvé dans le stockage sécurisé.");
      return null;
    }

    // ✅ Utilisation de ENV.API_URL défini dans votre config
    // Nous utilisons une instance axios brute pour ne pas interférer avec l'intercepteur global
    const res = await axios.post(`${ENV.API_URL}/auth/refresh`, { 
      refreshToken: refresh 
    }, {
      timeout: 10000 // Sécurité pour les connexions mobiles lentes
    });

    const { token: newToken, refreshToken: newRefresh } = res.data;

    if (!newToken) {
      throw new Error("Réponse serveur incomplète : token manquant.");
    }

    // ✅ Sauvegarde des nouveaux jetons (supporte la rotation du refresh token)
    await saveTokens(newToken, newRefresh || refresh);

    // ✅ Mise à jour dynamique du Store Zustand
    // On utilise 'require' pour éviter les dépendances circulaires au démarrage de l'app
    const { useAuthStore } = require("../stores/useAuthStore");
    useAuthStore.setState({ token: newToken });

    console.log("[AUTH] Rafraîchissement du jeton réussi.");
    return newToken;

  } catch (err: any) {
    console.error("[AUTH] Échec du rafraîchissement du token :", err.message);

    // 🛑 En cas d'erreur 401 ou 403 (Refresh Token expiré ou révoqué)
    // On force la déconnexion pour protéger l'accès aux données judiciaires
    if (err.response?.status === 401 || err.response?.status === 403) {
      const { useAuthStore } = require("../stores/useAuthStore");
      
      await clearStorage();
      useAuthStore.getState().logout();
      
      console.warn("[AUTH] Session expirée. Redirection vers la connexion.");
    }
    
    return null;
  }
}