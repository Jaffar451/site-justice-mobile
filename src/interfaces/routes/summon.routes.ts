// PATH: src/interfaces/routes/summon.routes.ts
import { Router } from "express";
import {
  createSummon,
  listSummons,
  getSummonsByComplaint,
  updateSummonStatus,
} from "../controllers/summon.controller";

// 👇 1. Import des middlewares standards
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// 📌 Toutes les routes nécessitent une authentification
// 👇 2. CORRECTION : On utilise la variable importée 'authenticate'
router.use(authenticate);

// 🔹 Créer une convocation (Police, Juge, Greffier)
router.post(
    "/", 
    authorize(["police", "judge", "clerk", "admin"]), 
    createSummon
);

// 🔹 Lister toutes les convocations
router.get(
    "/", 
    authorize(["police", "judge", "clerk", "prosecutor", "admin"]), 
    listSummons
);

// 🔹 Lister les convocations pour une plainte spécifique
router.get(
    "/complaint/:complaintId", 
    authorize(["police", "judge", "clerk", "prosecutor", "admin"]), 
    getSummonsByComplaint
);

// 🔹 Mettre à jour le statut (ex: 'distribuée', 'signée')
router.patch(
    "/:id/status", 
    authorize(["police", "judge", "clerk", "admin"]), 
    updateSummonStatus
);

export default router;