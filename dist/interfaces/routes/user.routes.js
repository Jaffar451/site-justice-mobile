"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Importez chaque fonction nommément pour éviter les 'undefined'
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 🟢 PERSONNEL
router.get("/me", auth_middleware_1.authenticate, controllers_1.getMe);
router.patch("/me", auth_middleware_1.authenticate, controllers_1.updateMe);
// 🔔 PUSH TOKEN
router.patch("/push-token", auth_middleware_1.authenticate, controllers_1.updatePushToken);
// 🔴 ADMIN
router.get("/", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.listUsers);
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.createUser);
// 🟠 INDIVIDUEL
router.get("/:id", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.getUser);
router.patch("/:id", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.updateUser);
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.deleteUser);
exports.default = router;
