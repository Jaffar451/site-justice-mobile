"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController = __importStar(require("../controllers"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Middleware global : Seul l'ADMIN passe
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]));
// 📊 Stats Dashboard
router.get("/dashboard-stats", AdminController.getDashboardStats);
// 🏥 Santé du Système
router.get("/system-health", AdminController.getSystemHealth);
// 📜 Logs Système
router.get("/logs", AdminController.getSystemLogs);
// 🔐 Settings & Sécurité
router.get("/security/settings", AdminController.getSecuritySettings);
router.get("/security/overview", AdminController.getSecuritySettings);
router.put("/security/settings", AdminController.updateSecuritySettings);
// 🛠️ Maintenance (C'est ici que j'ai ajouté /status pour correspondre au Frontend)
router.get("/maintenance/status", AdminController.getMaintenanceStatus);
router.post("/maintenance/status", AdminController.setMaintenanceStatus);
// Route pour vider le cache
router.post("/maintenance/clear-cache", (req, res) => {
    // Logique simulée de vidage de cache
    console.log("🧹 Cache vidé par l'admin");
    res.json({ success: true, message: "Cache serveur vidé avec succès" });
});
exports.default = router;
