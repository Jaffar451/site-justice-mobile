"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const auditLog_model_1 = __importDefault(require("../models/auditLog.model"));
const logActivity = async (req, action, details = "", resourceType = "SYSTEM", resourceId = null, severity = 'info') => {
    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';
        await auditLog_model_1.default.create({
            // ✅ CORRECTION 1 : Si pas d'utilisateur (ex: login échoué), on met 0 au lieu de null
            userId: req.user?.id ?? 0,
            action,
            details,
            resourceType,
            // ✅ CORRECTION 2 : Si pas d'ID de ressource, on met "N/A" au lieu de null
            resourceId: resourceId ? String(resourceId) : "N/A",
            ipAddress: ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            severity,
            createdAt: new Date()
        });
    }
    catch (error) {
        console.error("❌ AUDIT_LOG_FAILURE:", error);
    }
};
exports.logActivity = logActivity;
