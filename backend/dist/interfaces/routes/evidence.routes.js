"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evidence_controller_1 = require("../controllers/evidence.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const upload_evidence_middleware_1 = require("../../middleware/upload-evidence.middleware");
const router = (0, express_1.Router)();
// Lecture → Police / Juge / Greffier / Procureur / Admin
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "judge", "clerk", "admin"), evidence_controller_1.listEvidence);
// Création → Police uniquement
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police"), upload_evidence_middleware_1.uploadEvidence, evidence_controller_1.createEvidence);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "judge", "clerk", "admin"), evidence_controller_1.getEvidence);
// Modification → Police ou Juge
router.put("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "judge"), evidence_controller_1.updateEvidence);
// Suppression → Admin
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), evidence_controller_1.deleteEvidence);
exports.default = router;
