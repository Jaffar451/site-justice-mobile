// src/config/env.ts
import { Platform } from 'react-native';

// ==========================================
// 1. TES URLS POSSIBLES
// ==========================================

// ✅ CORRECTION : L'URL exacte vue dans tes logs Render
const SERVER_RENDER = "https://site-justice-mobile.onrender.com/api"; 

// 🏠 L'URL Locale (Si tu travailles chez toi sans internet)
const LOCAL_IP = "192.168.1.152"; 
const SERVER_LOCAL = Platform.OS === 'android' 
  ? `http://${LOCAL_IP}:4000/api` 
  : 'http://localhost:4000/api';

// ==========================================
// 2. SÉLECTION DU SERVEUR ACTIF
// ==========================================

// 👉 On force Render pour que ton mobile discute avec le vrai serveur
const ACTIVE_URL = SERVER_RENDER;

// ==========================================
// 3. EXPORT
// ==========================================
export const ENV = {
  API_URL: ACTIVE_URL, // Cela prendra bien https://site-justice-mobile.onrender.com/api
  VERSION: "2.2.0",
  TIMEOUT: 30000,
};