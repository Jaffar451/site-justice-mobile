"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: backend/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const index_1 = __importDefault(require("./interfaces/routes/index"));
const app = (0, express_1.default)();
// ==========================================
// 🏗️ CONFIGURATION PROXY (IMPORTANT POUR PROD)
// ==========================================
app.set('trust proxy', 1);
// ==========================================
// 🛡️ COUCHE DE SÉCURITÉ (HELMET & CORS)
// ==========================================
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: env_1.env.NODE_ENV === "production" ? undefined : false,
}));
// ✅ CORRECTION CORS CRITIQUE
// On met "origin: true" pour refléter l'origine de la requête (ex: localhost:8081).
// Cela permet à Expo Web de fonctionner avec les cookies/headers sécurisés.
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));
// ==========================================
// 🚦 LIMITATION DES REQUÊTES (ANTI-DDOS)
// ==========================================
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.security.rateLimitWindowMs || 15 * 60 * 1000,
    max: env_1.env.security.rateLimitMax || 100,
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
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
if (env_1.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("short"));
}
// ==========================================
// 📂 GESTION DES FICHIERS STATIQUES
// ==========================================
const uploadsPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsPath)) {
    console.log(`📂 [INFO] Dossier 'uploads' introuvable. Création automatique...`);
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
}
console.log(`📂 [INFO] Dossier Uploads servi depuis : ${uploadsPath}`);
app.use("/uploads", express_1.default.static(uploadsPath));
// ==========================================
// 🚀 POINTS D'ENTRÉE (API ROUTES)
// ==========================================
app.use("/api", index_1.default);
// Health Check (Monitoring)
app.get("/", (_req, res) => {
    res.status(200).json({
        status: "✅ e-Justice Niger API Online",
        version: "2.2.0",
        environment: env_1.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});
// ==========================================
// 🛑 GESTION DES ERREURS
// ==========================================
// 404 - Ressource non trouvée
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "❌ La ressource demandée n'existe pas (404)."
    });
});
// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Erreur interne du serveur.";
    if (statusCode === 500) {
        console.error(`🔴 [SERVER ERROR] ${new Date().toISOString()} :`, err.stack || err);
    }
    else {
        console.warn(`⚠️ [APP ERROR] ${message}`);
    }
    res.status(statusCode).json({
        success: false,
        message: message,
        stack: env_1.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
exports.default = app;
