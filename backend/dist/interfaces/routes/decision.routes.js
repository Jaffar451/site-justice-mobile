"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const decision_controller_1 = require("../controllers/decision.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
// 🔹 Liste des décisions
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk", "police", "admin"), decision_controller_1.listDecisions);
// 🔹 Liste par affaire
router.get("/case/:caseId", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk", "police", "admin"), decision_controller_1.listDecisionsByCase);
// 🔹 Création décision : juge uniquement
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge"), decision_controller_1.createDecision);
// 🔹 Lecture décision
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk", "police", "admin"), decision_controller_1.getDecision);
// 🔹 Modification décision : si non signée
router.put("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge"), decision_controller_1.updateDecision);
// 🔹 Suppression décision : admin uniquement
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), decision_controller_1.deleteDecision);
router.patch("/:id/sign", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge"), decision_controller_1.signDecision);
exports.default = router;
