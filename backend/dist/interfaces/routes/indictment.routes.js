"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/indictment.routes.ts
const express_1 = require("express");
const indictment_controller_1 = require("../controllers/indictment.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
// 📌 Création — uniquement par les juges
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge"), indictment_controller_1.createIndictment);
// 📌 Lecture — tous rôles autorisés
router.get("/:id", auth_middleware_1.default, indictment_controller_1.getIndictment);
// 📌 Mise à jour — uniquement juges
router.put("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("judge"), indictment_controller_1.updateIndictment);
// 📌 Suppression — uniquement admin
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), indictment_controller_1.deleteIndictment);
exports.default = router;
