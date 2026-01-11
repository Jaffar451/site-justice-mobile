import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth.service';
import { secureSet, secureDelete } from '../utils/secureStorage';

// ✅ IMPORT CRITIQUE POUR LA NAVIGATION
import { reset } from '../navigation/RootNavigation';

interface AuthState {
  user: User | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isHydrating: boolean;

  login: (identifier: string, password: string) => Promise<void>;
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
          const response = await apiLogin(identifier, password);
          const res = response as any; 

          console.log("🔍 LOGIN REPONSE COMPLETE:", JSON.stringify(res, null, 2));

          const userData = res.data?.user || res.data?.data?.user || res.user;
          const accessToken = res.data?.tokens?.accessToken || res.data?.data?.tokens?.accessToken || res.tokens?.accessToken || res.token;
          const refreshToken = res.data?.tokens?.refreshToken || res.data?.data?.tokens?.refreshToken || res.tokens?.refreshToken;

          if (!userData || !accessToken) {
            throw new Error("Données utilisateur ou token manquants.");
          }

          await secureSet('token', accessToken);
          if (refreshToken) await secureSet('refreshToken', refreshToken);

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
            error: err.response?.data?.message || err.message || "Identifiant ou mot de passe incorrect.",
            isAuthenticated: false,
          });
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await apiRegister(userData);
          const res = response as any;

          // Auto-login si le token est présent
          const token = res.token || res.data?.token;
          const user = res.user || res.data?.user;

          if (token && user) {
            await secureSet('token', token);
            set({ 
               user: user, 
               role: user.role, 
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

      // ✅ LOGOUT CORRIGÉ AVEC NAVIGATION
      logout: async () => {
        try { 
            await apiLogout(); 
        } catch (e) {
            console.log("Erreur API Logout (ignorable)", e);
        } finally {
          // 1. Nettoyage
          await secureDelete('token');
          await secureDelete('refreshToken');
          
          // 2. Mise à jour de l'état
          set({ 
              user: null, 
              role: null, 
              token: null, 
              isAuthenticated: false, 
              error: null,
              isHydrating: false // Important pour ne pas bloquer le loading
          });

          // 3. 🚀 Redirection forcée vers Login pour éviter l'écran blanc
          reset('Auth', { screen: 'Login' });
        }
      },

      setUser: (user: User) => { 
        set({ user, role: user.role }); 
      },

      hydrate: async () => {
        set({ isHydrating: true });
        // Simule un délai court pour laisser le temps à 'persist' de charger depuis AsyncStorage
        setTimeout(() => set({ isHydrating: false }), 500);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        role: state.role, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }), 
    }
  )
);