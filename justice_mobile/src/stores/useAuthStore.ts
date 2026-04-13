import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthService from '../services/auth.service';
import { saveAuthData, logoutFromApi } from '../services/api';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: (refreshToken?: string) => Promise<void>;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async ({ identifier, password }) => {
        set({ loading: true, error: null });
        try {
          const response: any = await AuthService.login(identifier, password);
          const data = response.data || response;
          const token = data.token;
          const user = data.user;

          if (!token || !user) throw new Error('Données d\'authentification invalides');

          await saveAuthData(token, user, data.refreshToken);
          set({ user, isAuthenticated: true, loading: false, error: null });
        } catch (err: any) {
          set({ 
            loading: false, 
            error: err.message || 'Échec de connexion' 
          });
          throw err;
        }
      },

      // CORRECTION : On définit le type de la fonction ici pour forcer le respect de l'interface
      logout: async (refreshToken?: string): Promise<void> => {
        try {
          if (refreshToken) {
            await logoutFromApi({ refresh: refreshToken });
          }
        } catch (err) {
          console.error("Erreur API logout:", err);
        } finally {
          set({ user: null, isAuthenticated: false, loading: false, error: null });
        }
      },

      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);