"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const auditLog_model_1 = __importDefault(require("../../models/auditLog.model"));
/**
 * 🕵️ SERVICE DE LOG D'ACTIVITÉ
 * Enregistre les actions métier et techniques dans la table audit_logs.
 */
const logActivity = async (req, action, resourceType, resourceId, severity = 'info') => {
    try {
        await auditLog_model_1.default.create({
            // 1. Identification de l'acteur
            userId: req.user?.id || 0,
            action: action,
            // 2. Métadonnées techniques (Synchronisées avec les colonnes SQL ajoutées)
            method: req.method || 'INTERNAL',
            endpoint: req.originalUrl || 'N/A',
            // Extraction sécurisée de l'IP (gestion proxy incluse)
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            // 3. Métadonnées métier
            resourceType: resourceType,
            resourceId: String(resourceId),
            severity: severity,
            // ✅ CORRECTION : Ajout du champ 'details' obligatoire
            // On construit une description dynamique pour faciliter la lecture côté Admin
            details: `Action: ${action} | Ressource: ${resourceType} (#${resourceId}) | Par: ${req.user?.firstname || 'Système'}`,
            createdAt: new Date()
        });
    }
    catch (error) {
        // On log l'erreur en console mais on ne bloque pas le flux principal de l'application
        console.error("❌ [CRITICAL_AUDIT_SERVICE_ERROR]:", error.message);
    }
};
exports.logActivity = logActivity;
