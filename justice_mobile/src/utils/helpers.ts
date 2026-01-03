// src/utils/helpers.ts

import { Platform } from "react-native";

/**
 * 🔢 FORMATAGE DE NOMBRES & DEVISES
 */

export function formatNumber(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "0";
  // Utilise les espaces insécables pour les milliers (standard francophone)
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function formatCurrency(value: number | string, currency: string = "XOF"): string {
  const num = Number(value);
  if (isNaN(num)) return "0 " + currency;
  
  // XOF (FCFA) n'a pas de décimales habituellement
  const maximumFractionDigits = currency === "XOF" ? 0 : 2;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits,
  }).format(num);
}

/**
 * 📞 FORMATAGE TÉLÉPHONE (Spécifique Niger)
 * Transforme "90123456" en "90 12 34 56"
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return "";
  
  // Nettoyer : garder uniquement les chiffres
  const cleaned = phone.replace(/\D/g, "");
  
  // Gestion du format international (+227)
  if (cleaned.startsWith("227") && cleaned.length === 11) {
    const number = cleaned.slice(3);
    return `+227 ${number.replace(/(\d{2})(?=\d)/g, "$1 ")}`;
  }
  
  // Format local (8 chiffres)
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(?=\d)/g, "$1 ");
  }

  return phone; // Retourne tel quel si format inconnu
}

/**
 * 📅 FORMATAGE DE DATES
 */

export function formatDate(date: string | Date | null | undefined, format: "short" | "long" | "full" = "short"): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "Date invalide";
  
  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case "short":
      // Ex: 25/12/2023
      options = { day: "2-digit", month: "2-digit", year: "numeric" };
      break;
    case "long":
      // Ex: 25 décembre 2023
      options = { day: "numeric", month: "long", year: "numeric" };
      break;
    case "full":
      // Ex: Lundi 25 décembre 2023
      options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
      break;
    default:
      options = { day: "2-digit", month: "2-digit", year: "numeric" };
  }
  
  return new Intl.DateTimeFormat("fr-FR", options).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "Date invalide";
  
  // Ex: 25/12/2023 à 14:30
  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).format(d);

  const timeStr = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit", minute: "2-digit"
  }).format(d);

  return `${dateStr} à ${timeStr}`;
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  
  // Si la date est dans le futur
  if (diffMs < 0) return formatDate(d);

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return formatDate(d);
}

/**
 * 💾 FORMATAGE FICHIERS (Pour les preuves/pièces jointes)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 📝 FORMATAGE DE TEXTE & IDENTITÉ
 */

export function capitalizeFirst(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formate un nom complet : NOM en majuscule, Prénom en Capitalize
 * Ex: "issoufou mahamadou" -> "ISSOUFOU Mahamadou"
 */
export function formatIdentity(lastname: string, firstname: string): string {
  const cleanLast = (lastname || "").toUpperCase();
  const cleanFirst = capitalizeFirst(firstname || "");
  return `${cleanLast} ${cleanFirst}`.trim();
}

export function truncate(text: string, maxLength: number = 100): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/\s+/g, "-")            // Remplace les espaces par -
    .replace(/[^\w-]+/g, "")         // Supprime les caractères non alphanumériques
    .replace(/--+/g, "-")            // Remplace les - multiples par un seul
    .replace(/^-+/, "")              // Coupe les - au début
    .replace(/-+$/, "");             // Coupe les - à la fin
}

/**
 * 🎨 STATUTS ET BADGES
 */

export type StatusType = "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled" | "archived" | "transferred";

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "En attente",
    approved: "Validé",
    rejected: "Rejeté",
    in_progress: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
    archived: "Archivé",
    transferred: "Transmis au Parquet",
    draft: "Brouillon"
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#F59E0B",     // Orange (Warning)
    approved: "#10B981",    // Vert (Success)
    rejected: "#EF4444",    // Rouge (Error)
    in_progress: "#3B82F6", // Bleu (Info)
    completed: "#64748B",   // Gris (Neutral)
    cancelled: "#94A3B8",   // Gris clair
    archived: "#475569",    // Gris foncé
    transferred: "#8B5CF6", // Violet
    draft: "#A8A29E"        // Pierre
  };
  return colors[status] || "#64748B";
}

/**
 * 🔐 VALIDATION
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Format Niger: 8 chiffres, commençant souvent par 7, 8, 9
  // Accepte avec ou sans +227
  const cleaned = phone.replace(/\s/g, "").replace("+", "");
  
  if (cleaned.startsWith("227")) {
     return /^(227)[0-9]{8}$/.test(cleaned);
  }
  return /^[0-9]{8}$/.test(cleaned);
}

export function isStrongPassword(password: string): boolean {
  // Min 8 caractères
  if (password.length < 8) return false;
  
  // Vérification de la complexité
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * 🔄 UTILITAIRES GÉNÉRAUX
 */

/**
 * Version compatible React Native / Web pour le typage du Timer
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>; // ✅ Correction TS
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Générateur d'ID simple pour le frontend (listes temporaires)
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * 📊 MANIPULATION DE DONNÉES
 */

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * 🌐 GESTION DES ERREURS API
 */

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;

  // Erreur axios standard
  if (error.response?.data?.message) {
    if (Array.isArray(error.response.data.message)) {
        return error.response.data.message[0]; // NestJS renvoie parfois un tableau
    }
    return error.response.data.message;
  }
  
  // Erreur réseau
  if (error.message === 'Network Error') {
    return "Problème de connexion internet. Vérifiez votre réseau.";
  }

  return error.message || "Une erreur inattendue est survenue.";
}