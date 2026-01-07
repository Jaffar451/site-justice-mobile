// (Rappel) src/interfaces/routes/admin.routes.ts
import { Router } from "express";
import * as AdminController from "../controllers/admin.controller"; // Import global
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// Middleware global pour ce routeur : Seul l'ADMIN passe
router.use(authenticate, authorize(["admin"]));

// Stats
router.get("/dashboard-stats", AdminController.getDashboardStats);

// Logs
// router.get("/audit-logs", ...); // Si tu as un contrôleur de logs séparé

// Settings
router.get("/settings/security", AdminController.getSecuritySettings);
router.put("/settings/security", AdminController.updateSecuritySettings);

// Maintenance
router.get("/maintenance", AdminController.getMaintenanceStatus);
router.post("/maintenance", AdminController.setMaintenanceStatus);

export default router;