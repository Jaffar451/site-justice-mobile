// PATH: backend/src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs"; // ✅ Ajouté pour vérifier l'existence des dossiers
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import routes from "./interfaces/routes/index"; 

const app = express();

// ==========================================
// 🏗️ CONFIGURATION PROXY (IMPORTANT POUR PROD)
// ==========================================
// Si l'app tourne derrière Nginx/Apache, il faut faire confiance au proxy 
// pour avoir la vraie IP du client (sinon le rateLimit bloque le proxy).
app.set('trust proxy', 1); 

// ==========================================
// 🛡️ COUCHE DE SÉCURITÉ (HELMET & CORS)
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, 
  contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
}));

app.use(cors({ 
  origin: env.security.corsOrigin, // Assure-toi que c'est bien défini dans ton env.ts
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ==========================================
// 🚦 LIMITATION DES REQUÊTES (ANTI-DDOS)
// ==========================================
const limiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs || 15 * 60 * 1000, // 15 minutes
  max: env.security.rateLimitMax || 100, // Limite par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: "⛔ Trop de requêtes. Veuillez patienter avant de réessayer." 
  }
});

// Application du limiteur uniquement aux routes API
app.use("/api/", limiter);

// ==========================================
// ⚙️ MIDDLEWARES DE PARSING & LOGS
// ==========================================
// ✅ Augmenté à 50mb pour supporter les photos HD modernes
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logs HTTP
if (env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
} else {
  // En prod, on loggue moins verbeux ou format combiné
  app.use(morgan("short"));
}

// ==========================================
// 📂 GESTION DES FICHIERS STATIQUES
// ==========================================
const uploadsPath = path.join(process.cwd(), "uploads");

// ✅ SÉCURITÉ & STABILITÉ : On vérifie si le dossier existe, sinon on le crée
if (!fs.existsSync(uploadsPath)) {
  console.log(`📂 [INFO] Dossier 'uploads' introuvable. Création automatique...`);
  fs.mkdirSync(uploadsPath, { recursive: true });
}

console.log(`📂 [INFO] Dossier Uploads servi depuis : ${uploadsPath}`);
app.use("/uploads", express.static(uploadsPath));

// ==========================================
// 🚀 POINTS D'ENTRÉE (API ROUTES)
// ==========================================
app.use("/api", routes);

// Health Check (Monitoring)
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: "✅ e-Justice Niger API Online", 
    version: "2.2.0", 
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 🛑 GESTION DES ERREURS
// ==========================================

// 404 - Ressource non trouvée
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: "❌ La ressource demandée n'existe pas (404)." 
  });
});

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = err.message || "Erreur interne du serveur.";
  
  // Log serveur détaillé pour le développeur/sysadmin
  if (statusCode === 500) {
    console.error(`🔴 [SERVER ERROR] ${new Date().toISOString()} :`, err.stack || err);
  } else {
    console.warn(`⚠️ [APP ERROR] ${message}`);
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    // On ne renvoie la stack trace qu'en mode développement pour la sécurité
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;