import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
// ✅ AJOUT : Import de register as apiRegister
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth.service';
import { secureSet, secureDelete } from '../utils/secureStorage';

interface AuthState {
  user: User | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isHydrating: boolean;

  login: (identifier: string, password: string) => Promise<void>;
  // ✅ AJOUT : Définition de la méthode register
  register: (data: any) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      isHydrating: true,

      login: async (identifier, password) => {
        set({ loading: true, error: null });
        try {
          // 1. Appel API
          const response = await apiLogin(identifier, password);
          
          // ⚠️ CORRECTION : On force le type 'any' pour contourner l'erreur TypeScript
          const res = response as any; 

          console.log("🔍 LOGIN REPONSE COMPLETE:", JSON.stringify(res, null, 2));

          // 2. Extraction des données (Compatible V1 et V2)
          const userData = res.data?.user || res.data?.data?.user || res.user;
          
          // Récupération des Tokens
          const accessToken = res.data?.tokens?.accessToken || res.data?.data?.tokens?.accessToken || res.tokens?.accessToken || res.token;
          const refreshToken = res.data?.tokens?.refreshToken || res.data?.data?.tokens?.refreshToken || res.tokens?.refreshToken;

          // Vérification de sécurité
          if (!userData || !accessToken) {
            throw new Error("Données utilisateur ou token manquants dans la réponse du serveur.");
          }

          // 3. Sauvegarde sécurisée
          await secureSet('token', accessToken);
          if (refreshToken) {
            await secureSet('refreshToken', refreshToken);
          }

          console.log("✅ ROLE DÉTECTÉ :", userData.role);

          // 4. Mise à jour du Store
          set({
            user: userData,
            role: userData.role,
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
        } catch (err: any) {
          console.error("❌ Erreur Login Store:", err);
          set({
            loading: false,
            // Affiche le message du backend si disponible, sinon le message d'erreur générique
            error: err.response?.data?.message || err.message || "Identifiant ou mot de passe incorrect.",
            isAuthenticated: false,
          });
        }
      },

      // ✅ AJOUT : Implémentation de register sans supprimer le reste
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await apiRegister(userData);
          const res = response as any;

          // Tentative de connexion automatique si le token est renvoyé
          const token = res.token || res.data?.token;
          const user = res.user || res.data?.user;

          if (token && user) {
            await secureSet('token', token);
            set({ 
               user: user, 
               role: user.role, // Important pour la redirection
               token: token, 
               isAuthenticated: true, 
               loading: false,
               error: null
            });
          } else {
             set({ loading: false });
          }
        } catch (err: any) {
          set({ 
            loading: false,
            error: err.response?.data?.message || "Erreur lors de l'inscription"
          });
          throw err;
        }
      },

      logout: async () => {
        try { await apiLogout(); } catch (e) {} 
        finally {
          await secureDelete('token');
          await secureDelete('refreshToken');
          set({ user: null, role: null, token: null, isAuthenticated: false, error: null });
        }
      },

      setUser: (user: User) => { 
        set({ user, role: user.role }); 
      },

      hydrate: async () => {
        set({ isHydrating: true });
        setTimeout(() => set({ isHydrating: false }), 500);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // ✅ MODIFICATION CRUCIALE ICI : J'ai ajouté 'token' à la liste
      // Cela permet de garder le token en mémoire même après un refresh (F5)
      partialize: (state) => ({ 
        user: state.user, 
        role: state.role, 
        token: state.token, // <--- AJOUTÉ
        isAuthenticated: state.isAuthenticated 
      }), 
    }
  )
);