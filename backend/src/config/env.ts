// PATH: src/config/env.ts
import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis .env
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  // On s'assure que le PORT est bien un nombre pour éviter l'erreur TypeScript
  PORT: parseInt(process.env.PORT || "4000", 10),

  // Configuration Base de données
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
    name: process.env.DB_NAME || "justice_db",
  },

  // ✅ CONFIGURATION JWT COMPLÈTE (C'est ici que ça bloquait)
  jwt: {
    // Clé pour le Token d'accès (court terme)
    secret: process.env.JWT_SECRET || "SUPER_SECRET_KEY_JUSTICE_NIGER_2025",
    expiration: process.env.JWT_EXPIRATION || "24h",
    
    // Clé pour le Token de rafraîchissement (long terme) -> Celle qui manquait !
    refreshSecret: process.env.JWT_REFRESH_SECRET || "SUPER_REFRESH_SECRET_KEY_2025", 
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d", // Valable 7 jours
  },

  // Sécurité & CORS
  security: {
    corsOrigin: process.env.CORS_ORIGIN || "*", 
    // On duplique ici pour compatibilité si d'autres fichiers l'utilisent
    jwtSecret: process.env.JWT_SECRET || "SUPER_SECRET_KEY_JUSTICE_NIGER_2025",
    rateLimitWindowMs: 15 * 60 * 1000, 
    rateLimitMax: 100, 
  },

  // Gestion des fichiers (Uploads)
  files: {
    path: process.env.UPLOAD_PATH || path.join(__dirname, "../../uploads"),
    maxSize: 10 * 1024 * 1024, // 10MB
  },

  // Configuration Socket.IO
  socket: {
    corsOrigin: process.env.CORS_ORIGIN || "*",
  }
};