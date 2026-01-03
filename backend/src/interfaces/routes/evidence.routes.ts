// PATH: src/interfaces/routes/evidence.routes.ts
import { Router } from "express";
import {
  listEvidence,
  createEvidence,
  getEvidence,
  updateEvidence,
  deleteEvidence,
} from "../controllers/evidence.controller";

// 👇 1. Import des middlewares standards
import { authenticate, authorize } from "../../middleware/auth.middleware";

// 👇 2. Si tu as ce middleware, décommente-le. Sinon, laisse commenté pour éviter le crash.
// import { uploadEvidence } from "../../middleware/upload-evidence.middleware";

const router = Router();

// Lecture → Police / Juge / Greffier / Procureur / Admin
router.get(
  "/", 
  authenticate, 
  authorize(["police", "judge", "clerk", "prosecutor", "admin"]), 
  listEvidence
);

// Création → Police uniquement (avec upload si disponible)
router.post(
  "/", 
  authenticate, 
  authorize(["police"]), 
  // uploadEvidence, // Décommente si le fichier existe
  createEvidence
);

router.get(
  "/:id", 
  authenticate, 
  authorize(["police", "judge", "clerk", "admin"]), 
  getEvidence
);

// Modification → Police ou Juge
router.put(
  "/:id", 
  authenticate, 
  authorize(["police", "judge"]), 
  updateEvidence
);

// Suppression → Admin
router.delete(
  "/:id", 
  authenticate, 
  authorize(["admin"]), 
  deleteEvidence
);

export default router;