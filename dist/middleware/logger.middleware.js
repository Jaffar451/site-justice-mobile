"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const auditLog_model_1 = __importDefault(require("../models/auditLog.model")); // Assurez-vous du bon chemin
const requestLogger = (req, res, next) => {
    // On attend que la réponse soit terminée pour avoir le statut final
    res.on('finish', async () => {
        // 1. Ignorer les requêtes OPTIONS (preflight CORS) pour ne pas polluer les logs
        if (req.method === 'OPTIONS')
            return;
        // 2. Ignorer les fichiers statiques (images, css...) si nécessaire
        if (req.originalUrl.startsWith('/assets') || req.originalUrl.startsWith('/static'))
            return;
        try {
            // 3. Détermination de la sévérité
            let severity = 'info';
            if (res.statusCode >= 500)
                severity = 'critical';
            else if (res.statusCode >= 400)
                severity = 'warning';
            // 4. Extraction de l'IP (Gère les proxies type Nginx/Heroku)
            const ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '0.0.0.0';
            // 5. Création du Log
            await auditLog_model_1.default.create({
                action: `HTTP ${req.method}`, // Ex: "HTTP POST"
                method: req.method,
                endpoint: req.originalUrl,
                ipAddress: ip, // Mappé vers le champ ip_address de la BDD
                severity: severity,
                status: res.statusCode.toString(),
                details: JSON.stringify(req.body || {}), // Attention : Pensez à masquer les mots de passe ici si besoin
                resourceType: 'API',
                resourceId: req.params.id || null,
                userAgent: req.headers['user-agent'] || 'Unknown',
                userId: req.user ? req.user.id : null // Si l'utilisateur est authentifié
            });
        }
        catch (err) {
            // Ne jamais faire planter l'API à cause du logger
            console.error("⚠️ Erreur Logger Middleware:", err);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
