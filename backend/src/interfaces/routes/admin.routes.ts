import { Router } from "express";
import { AdminController } from "../controllers/admin.controller"; 
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();
const controller = new AdminController();

/**
 * 📊 DASHBOARD
 * @route   GET /api/admin/dashboard-stats
 * @desc    Récupérer les statistiques globales
 */
router.get(
  "/dashboard-stats", 
  authenticate,
  authorize(["admin"]),
  (req, res) => controller.getDashboardStats(req, res)
);

/**
 * 🔐 SÉCURITÉ
 * @route   GET /api/admin/settings/security
 * @desc    Lire la politique de mot de passe actuelle
 */
router.get(
  "/settings/security",
  authenticate,
  authorize(["admin"]),
  (req, res) => controller.getSecuritySettings(req, res)
);

/**
 * 🔐 SÉCURITÉ
 * @route   PUT /api/admin/settings/security
 * @desc    Mettre à jour la politique de mot de passe
 */
router.put(
  "/settings/security",
  authenticate,
  authorize(["admin"]),
  (req, res) => controller.updateSecuritySettings(req, res)
);

/**
 * 🚧 MAINTENANCE
 * @route   GET /api/admin/maintenance
 * @desc    Vérifier si le mode maintenance est actif
 */
router.get(
  "/maintenance",
  authenticate,
  authorize(["admin"]),
  (req, res) => controller.getMaintenanceStatus(req, res)
);

/**
 * 🚧 MAINTENANCE
 * @route   POST /api/admin/maintenance
 * @desc    Activer ou désactiver la maintenance
 */
router.post(
  "/maintenance",
  authenticate,
  authorize(["admin"]),
  (req, res) => controller.setMaintenanceStatus(req, res)
);

export default router;