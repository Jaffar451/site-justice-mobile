// PATH: src/interfaces/routes/assignment.routes.ts
import { Router } from "express";

// 👇 1. Import des fonctions du contrôleur
import {
  listAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controller";

// 👇 2. Import des middlewares standards
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// 📌 LISTE : Admin + Agents de justice
router.get(
  "/",
  authenticate,
  authorize(["admin", "police", "prosecutor", "judge", "clerk"]),
  listAssignments
);

// 📌 CRÉATION : Police + Procureur + Admin
router.post(
  "/",
  authenticate,
  authorize(["police", "prosecutor", "admin"]),
  createAssignment
);

// 📌 CONSULTATION : Admin + Agents de justice
router.get(
  "/:id",
  authenticate,
  authorize(["admin", "police", "prosecutor", "judge", "clerk"]),
  getAssignment
);

// 📌 MISE À JOUR : Police + Procureur + Juge + Admin
router.put( // ou patch
  "/:id",
  authenticate,
  authorize(["police", "prosecutor", "judge", "admin"]),
  updateAssignment
);

// 📌 SUPPRESSION : Admin uniquement
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  deleteAssignment
);

export default router;