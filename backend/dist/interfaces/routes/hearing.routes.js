"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hearing_controller_1 = require("../controllers/hearing.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk", "police", "admin"), hearing_controller_1.listHearings);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk", "police", "admin"), hearing_controller_1.getHearing);
// Juge + Greffier → Gestion audiences
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk"), hearing_controller_1.createHearing);
router.put("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge", "clerk"), hearing_controller_1.updateHearing);
// Admin → Suppression
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), hearing_controller_1.deleteHearing);
exports.default = router;
