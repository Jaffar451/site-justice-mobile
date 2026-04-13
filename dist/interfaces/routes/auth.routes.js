"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/auth.routes.ts
const express_1 = require("express");
// ✅ Import nommé (les accolades sont importantes)
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware"); // Si tu as ce middleware
const router = (0, express_1.Router)();
router.post("/register", controllers_1.register);
router.post("/login", controllers_1.login);
router.post("/refresh-token", controllers_1.refreshToken);
router.get("/me", auth_middleware_1.authenticate, controllers_1.me);
// ✨ Route Magique Admin
router.get("/create-super-admin", controllers_1.createSuperAdmin);
exports.default = router;
