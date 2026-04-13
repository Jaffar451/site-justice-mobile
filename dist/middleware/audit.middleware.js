"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAction = void 0;
const models_1 = require("../models");
/**
 * 🕵️ MIDDLEWARE D'AUDIT GLOBAL
 * Ce middleware intercepte la réponse à la fin du cycle de requête
 * pour enregistrer l'activité de l'utilisateur.
 */
const auditAction = (action, severity = 'info') => {
    return async (req, res, next) => {
        // On écoute l'événement 'finish' pour s'assurer que la requête est terminée
        res.on('finish', async () => {
            try {
                // Optionnel : On n'enregistre que les succès ou les erreurs spécifiques (2xx, 4xx, 5xx)
                // Ici on enregistre tout ce qui n'est pas une simple lecture (GET) pour l'audit métier,
                // ou tout si vous voulez un log technique complet.
                await models_1.AuditLog.create({
                    // 1. Identification de l'acteur (via votre middleware d'auth)
                    userId: req.user?.id || 0,
                    action: action,
                    // 2. Détails techniques (Synchronisés avec les colonnes SQL)
                    method: req.method,
                    endpoint: req.originalUrl,
                    // ✅ Correction : ipAddress mappe vers ip_address en BDD
                    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    // 3. Métriques métier
                    severity: severity,
                    status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
                    // Construction d'un détail lisible pour l'admin
                    details: `Route: ${req.originalUrl} | Status: ${res.statusCode} | User: ${req.user?.firstname || 'Anonyme'} ${req.user?.lastname || ''}`,
                    // Resource (Facultatif, peut être enrichi par le contrôleur)
                    resourceType: 'API_ENDPOINT',
                    resourceId: 'N/A'
                });
            }
            catch (error) {
                // Erreur silencieuse en prod pour ne pas bloquer le client, mais loguée sur le serveur
                console.error("⚠️ [AUDIT_MIDDLEWARE_ERROR]:", error.message);
            }
        });
        next();
    };
};
exports.auditAction = auditAction;
