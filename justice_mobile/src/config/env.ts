// src/config/env.ts
import { Platform } from 'react-native';

/**
 * 💻 CONFIGURATION RÉSEAU LOCALE
 * Android Emulator utilise l'IP 10.0.2.2 pour accéder au localhost du PC.
 * Pour un appareil physique, utilisez l'IP de votre machine sur le réseau WiFi.
 */
const LOCAL_IP = "192.168.1.XX"; // <-- ⚠️ REMPLACEZ PAR VOTRE IP LOCALE

const DEV_URL = Platform.OS === 'android' 
  ? `http://${LOCAL_IP}:4000/api` 
  : 'http://localhost:4000/api';

const PROD_URL = 'https://api.justice.gouv.ne/v1';

// ✅ Export groupé sous le nom ENV pour corriger l'erreur TS2305
export const ENV = {
  API_URL: __DEV__ ? DEV_URL : PROD_URL,
  VERSION: "1.5.0",
  TIMEOUT: 15000,
};