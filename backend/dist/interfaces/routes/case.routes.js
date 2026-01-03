"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/case.routes.ts
const express_1 = require("express");
const case_controller_1 = require("../controllers/case.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * 📌 Tous les rôles ayant un lien avec des affaires
 * - Citoyen → affaires de ses plaintes uniquement
 * - Police, Procureur, Juge, Greffier, Avocat → affectations
 * - Admin → tout
 */
router.get("/me", auth_middleware_1.default, (0, role_middleware_1.requireRole)("citizen", "police", "prosecutor", "judge", "clerk", "lawyer", "admin"), case_controller_1.listMyCases);
/**
 * 📌 Liste complète — Seulement Admin
 */
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), case_controller_1.listCases);
/**
 * 📌 Création d’une affaire
 * - Police : ouvre l'affaire après plainte
 * - Procureur : ouvre après réquisitoire
 * - Admin : surveillance
 */
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "prosecutor", "admin"), case_controller_1.createCase);
/**
 * 📌 Consultation de l’affaire
 * ⚠️ Contrôlé dans le controller car logique complexe
 */
router.get("/:id", auth_middleware_1.default, case_controller_1.getCase);
/**
 * 📌 Modification de l’affaire (changement de stage)
 * - Seuls les acteurs assignés à l'affaire avec un rôle de décision
 *   peuvent modifier l'étape de la procédure.
 */
const assignment_middleware_1 = require("../../middleware/assignment.middleware");
router.put("/:id", auth_middleware_1.default, (0, assignment_middleware_1.requireAssignmentRole)("prosecutor_supervisor", "judge_instruction", "judge_trial"), case_controller_1.updateCase);
/**
 * ❌ Suppression d’une affaire
 * - Uniquement admin
 */
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), case_controller_1.deleteCase);
exports.default = router;
