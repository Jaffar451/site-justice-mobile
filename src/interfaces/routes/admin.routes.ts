import { Router } from "express";
import * as AdminController from "../controllers/admin.controller"; 
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// Middleware global pour ce routeur : Seul l'ADMIN passe
router.use(authenticate, authorize(["admin"]));

// 📊 Stats Dashboard
router.get("/dashboard-stats", AdminController.getDashboardStats);

// 🏥 Santé du Système (C'est cette ligne qui corrige le "Unknown")
router.get("/system-health", AdminController.getSystemHealth);

// 📜 Logs Système (Pour l'écran des logs)
router.get("/logs", AdminController.getSystemLogs);

// 🔐 Settings & Sécurité
router.get("/security/settings", AdminController.getSecuritySettings);
router.get("/security/overview", AdminController.getSecuritySettings); // Alias pour compatibilité
router.put("/security/settings", AdminController.updateSecuritySettings);

// 🛠️ Maintenance
router.get("/maintenance", AdminController.getMaintenanceStatus);
router.post("/maintenance", AdminController.setMaintenanceStatus);

// Route pour vider le cache (réponse immédiate)
router.post("/maintenance/clear-cache", (req, res) => {
    res.json({ success: true, message: "Cache serveur vidé avec succès" });
});

export default router;