// PATH: src/config/env.ts
import { Platform } from 'react-native';

// ==========================================
// 1. DÉFINITION DES URLS
// ==========================================

// ✅ URL PROD (Render) - Note qu'elle finit déjà par /api
const SERVER_RENDER = "https://site-justice-mobile.onrender.com/api"; 

// 🏠 URL LOCALE (Pour dev chez toi)
// Remplace '192.168.1.152' par ton IP locale si besoin
const LOCAL_IP = "192.168.1.152"; 
const SERVER_LOCAL = Platform.OS === 'android' 
  ? `http://${LOCAL_IP}:4000/api` 
  : 'http://localhost:4000/api';

// ==========================================
// 2. SÉLECTION DU SERVEUR ACTIF
// ==========================================

// 👉 On force l'URL Render pour que ton mobile communique avec le vrai serveur
const ACTIVE_URL = SERVER_RENDER;

// ==========================================
// 3. EXPORT
// ==========================================
export const ENV = {
  // C'est ici que tout se joue : ACTIVE_URL contient déjà ".../api"
  API_URL: ACTIVE_URL, 
  VERSION: "2.2.0",
  TIMEOUT: 30000, // 30 secondes
};