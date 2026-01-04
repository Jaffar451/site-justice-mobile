// src/config/env.ts
import { Platform } from 'react-native';

// ==========================================
// 1. TES URLS POSSIBLES
// ==========================================

// ☁️ L'URL de ton serveur Render (Celle qui fonctionne sur Internet)
// ⚠️ VA SUR TON DASHBOARD RENDER, COPIE L'URL ET COLLE-LA CI-DESSOUS
// ⚠️ N'oublie pas d'ajouter "/api" à la fin si tes routes commencent par ça
const SERVER_RENDER = "https://e-justice-niger-backend.onrender.com/api"; 

// 🏠 L'URL Locale (Si tu travailles chez toi sans internet)
const LOCAL_IP = "192.168.1.152"; // Ton IP vue précédemment
const SERVER_LOCAL = Platform.OS === 'android' 
  ? `http://${LOCAL_IP}:4000/api` 
  : 'http://localhost:4000/api';

// ==========================================
// 2. SÉLECTION DU SERVEUR ACTIF
// ==========================================

// 👉 Pour l'instant, on FORCE Render pour tester la mise en ligne
// Même si tu es en mode DEV, on veut taper sur le serveur ONLINE.
const ACTIVE_URL = SERVER_RENDER;

// Plus tard, quand tout marchera, tu pourras remettre la logique automatique :
// const ACTIVE_URL = __DEV__ ? SERVER_LOCAL : SERVER_RENDER;

// ==========================================
// 3. EXPORT
// ==========================================
export const ENV = {
  API_URL: ACTIVE_URL,
  VERSION: "2.2.0", // J'ai mis à jour pour matcher ton Backend
  TIMEOUT: 30000,   // Augmenté à 30s (les serveurs gratuits Render sont parfois lents à répondre au premier appel)
};