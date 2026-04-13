// src/services/auth.service.ts
import { Platform } from 'react-native';
import api, { logoutFromApi } from './api';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    matricule?: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions?: string[];
    [key: string]: any;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  lastLogin?: string;
  [key: string]: any;
}

/**
 * Normalise la réponse pour garantir un objet user cohérent
 */
const normalizeAuthResponse = (data: any): AuthResponse => {
  if (data.user && typeof data.user === 'object') {
    return data as AuthResponse;
  }
  
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: {
      id: data.id,
      email: data.email,
      matricule: data.matricule,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      permissions: data.permissions || [],
      ...data
    }
  };
};

export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  const payload = { 
    identifier: identifier, 
    password: password 
  };

  try {
    const response = await api.post<any>('/auth/login', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return normalizeAuthResponse(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error("Détail erreur serveur :", error.response.data);
    }
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<any>('/auth/register', userData);
  return normalizeAuthResponse(response.data);
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/auth/me');
  return response.data;
};

export const updateProfile = async (userData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put<UserProfile>('/auth/update', userData);
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

// CORRECTION : Accepte le token de rafraîchissement
export const logout = async (refreshToken?: string): Promise<void> => {
  await logoutFromApi({ refresh: refreshToken || '' });
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/verify-email', { token });
  return response.data;
};

export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/resend-verification', { email });
  return response.data;
};

export const isEmailFormat = (identifier: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier);
};

// CORRECTION : Accepte le token de rafraîchissement
export const forceLogout = async (refreshToken?: string): Promise<void> => {
  await logoutFromApi({ refresh: refreshToken || '' });
  if (typeof window !== 'undefined' && Platform.OS === 'web') {
    window.dispatchEvent(new CustomEvent('auth:force-logout'));
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  isEmailFormat,
  forceLogout,
};

export default authService;