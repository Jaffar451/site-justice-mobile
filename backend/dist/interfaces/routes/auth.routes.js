"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const rateLimiter_middleware_1 = __importDefault(require("../../middleware/rateLimiter.middleware"));
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", rateLimiter_middleware_1.default, auth_controller_1.login); // 🔥 anti brute-force
router.post("/refresh", auth_controller_1.refreshToken); // 🔄 rotation JWT
router.get("/me", auth_middleware_1.default, auth_controller_1.me);
exports.default = router;
