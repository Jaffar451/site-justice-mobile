"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const arrestWarrant_controller_1 = require("../controllers/arrestWarrant.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const assignment_middleware_1 = require("../../middleware/assignment.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
// Seul un juge d'instruction assigné à l'affaire peut créer un mandat d'arrêt
router.post("/", auth_middleware_1.default, (0, assignment_middleware_1.requireAssignmentRole)("judge_instruction"), arrestWarrant_controller_1.createArrestWarrant);
// Seuls les agents judiciaires peuvent voir les mandats
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "prosecutor", "judge", "clerk", "admin"), arrestWarrant_controller_1.getArrestWarrants);
exports.default = router;
