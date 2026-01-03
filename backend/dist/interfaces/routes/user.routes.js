"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/user.routes.ts
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * 👤 Profil personnel
 */
router.get("/me", auth_middleware_1.default, user_controller_1.getMe);
router.patch("/me", auth_middleware_1.default, user_controller_1.updateMe);
/**
 * 🔐 Administration seule
 */
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), user_controller_1.listUsers);
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), user_controller_1.createUser);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), user_controller_1.getUser);
router.patch("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), user_controller_1.updateUser);
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), user_controller_1.deleteUser);
exports.default = router;
