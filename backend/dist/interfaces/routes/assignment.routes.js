"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/assignment.routes.ts
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
// 📌 LISTE : Admin + Agents de justice (police, procureur, juge, greffe)
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin", "police", "prosecutor", "judge", "clerk"), assignment_controller_1.listAssignments);
// 📌 CRÉATION : Police + Procureur + Admin
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "prosecutor", "admin"), assignment_controller_1.createAssignment);
// 📌 CONSULTATION : Admin + Agents de justice
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin", "police", "prosecutor", "judge", "clerk"), assignment_controller_1.getAssignment);
// 📌 MISE À JOUR : Police + Procureur + Juge + Admin
router.put("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "prosecutor", "judge", "admin"), assignment_controller_1.updateAssignment);
// 📌 SUPPRESSION : Admin uniquement
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), assignment_controller_1.deleteAssignment);
exports.default = router;
