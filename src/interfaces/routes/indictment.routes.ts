// PATH: src/interfaces/routes/indictment.routes.ts
import { Router } from "express";
// 👇 1. Import du contrôleur
import {
  createIndictment,
  getIndictment,
  updateIndictment,
  deleteIndictment,
} from "../controllers/indictment.controller";

// 👇 2. Import des middlewares standards
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// 📌 Création — uniquement par les juges (et Admin pour debug)
router.post(
  "/", 
  authenticate, 
  authorize(["judge", "admin"]), 
  createIndictment
);

// 📌 Lecture — Authentifié requis (contrôleur peut filtrer plus si besoin)
router.get(
  "/:id", 
  authenticate, 
  getIndictment
);

// 📌 Mise à jour — uniquement juges
router.put(
  "/:id", 
  authenticate, 
  authorize(["judge", "admin"]), 
  updateIndictment
);

// 📌 Suppression — uniquement admin
router.delete(
  "/:id", 
  authenticate, 
  authorize(["admin"]), 
  deleteIndictment
);

export default router;