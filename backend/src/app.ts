// PATH: backend/src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import routes from "./interfaces/routes/index"; 

const app = express();

// ==========================================
// 🛡️ COUCHE DE SÉCURITÉ (HELMET & CORS)
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permet l'affichage des PDF/Images sur le mobile
  contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
}));

app.use(cors({ 
  origin: env.security.corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ==========================================
// 🚦 LIMITATION DES REQUÊTES (ANTI-DDOS)
// ==========================================
const limiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs || 15 * 60 * 1000,
  max: env.security.rateLimitMax || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: "Trop de requêtes provenant de cette IP. Sécurité e-Justice Niger : veuillez patienter." 
  }
});

// On applique le limiteur uniquement aux routes API
app.use("/api/", limiter);

// ==========================================
// ⚙️ MIDDLEWARES DE PARSING & LOGS
// ==========================================
// ✅ Augmenté à 50mb pour supporter les photos HD modernes
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
}

// ==========================================
// 📂 GESTION DES FICHIERS STATIQUES
// ==========================================
// ✅ CORRECTION : Utilisation de process.cwd() pour cibler la racine du projet de manière fiable
const uploadsPath = path.join(process.cwd(), "uploads");

// Log pour vérifier au démarrage où le serveur cherche les images
console.log(`📂 [INFO] Dossier Uploads servi depuis : ${uploadsPath}`);

app.use("/uploads", express.static(uploadsPath));

// ==========================================
// 🚀 POINTS D'ENTRÉE (API ROUTES)
// ==========================================
app.use("/api", routes);

// Health Check (Utile pour le monitoring du Ministère)
app.get("/", (_req: Request, res: Response) => {
  res.json({ 
    status: "⚖️ Système National e-Justice Niger Online", 
    version: "2.2.0", 
    node_env: env.NODE_ENV,
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
    message: "La ressource demandée n'existe pas sur le serveur e-Justice." 
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  
  console.error(`🔴 [SERVER ERROR] [${new Date().toISOString()}] :`, err.stack);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Une erreur interne est survenue sur le serveur.",
    // On ne montre les détails de l'erreur qu'en développement
    error: env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;