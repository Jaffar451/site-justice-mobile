import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../../middleware/auth.middleware"; 

const router = Router();
const controller = new NotificationController();

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// Lecture
router.get("/", (req, res) => controller.getNotifications(req, res));
router.patch("/:id/read", (req, res) => controller.markAsRead(req, res));

// Suppression
// ✅ IMPORTANT : La route "/all" doit être déclarée AVANT "/:id"
router.delete("/all", (req, res) => controller.clearAll(req, res));

// ✅ AJOUT : Route pour supprimer une seule notification
router.delete("/:id", (req, res) => controller.deleteNotification(req, res));

export default router;