// PATH: src/interfaces/routes/case.routes.ts
import { Router } from "express";

// 👇 1. On importe les fonctions EXACTES de ton contrôleur
import {
  listCases,
  listMyCases,
  createCase,
  getCase,
  updateCase,
  deleteCase,
} from "../controllers/case.controller";

// 👇 2. On utilise le bon middleware standardisé
import { authenticate, authorize } from "../../middleware/auth.middleware";

// 👇 3. On commente ce middleware pour l'instant s'il fait planter le serveur
// Une fois que tu auras créé "assignment.middleware.ts", tu pourras le décommenter.
// import { requireAssignmentRole } from "../../middleware/assignment.middleware";

const router = Router();

/**
 * 📌 MES AFFAIRES (Filtrage automatique par rôle dans le contrôleur)
 * Accessible à tous les utilisateurs connectés
 */
router.get(
  "/me",
  authenticate,
  // Pas besoin de authorize précis ici car ton contrôleur gère 
  // le "if role === citizen" vs "police", etc.
  listMyCases
);

/**
 * 📌 LISTE COMPLÈTE
 * Réservé à l'Admin
 */
router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  listCases
);

/**
 * 📌 CRÉER UNE AFFAIRE
 * Police, Procureur, Admin
 */
router.post(
  "/",
  authenticate,
  authorize(["police", "prosecutor", "admin"]),
  createCase
);

/**
 * 📌 CONSULTER UNE AFFAIRE
 * Accessible à tous (le contrôleur vérifiera les droits d'accès si besoin)
 */
router.get(
  "/:id",
  authenticate,
  getCase
);

/**
 * 📌 MODIFIER UNE AFFAIRE
 * Juge, Procureur, Greffier, Admin
 * (On remplace temporairement requireAssignmentRole par authorize)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["judge", "prosecutor", "clerk", "admin"]),
  updateCase
);

/**
 * ❌ SUPPRIMER UNE AFFAIRE
 * Admin uniquement
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  deleteCase
);

export default router;