"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/summon.routes.ts
const express_1 = require("express");
const summon_controller_1 = require("../controllers/summon.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const router = (0, express_1.Router)();
// 📌 Toutes les routes nécessitent une authentification
router.use(auth_middleware_1.default);
// 🔹 Créer une convocation
router.post("/", summon_controller_1.createSummon);
// 🔹 Lister toutes les convocations
router.get("/", summon_controller_1.listSummons);
// 🔹 Lister les convocations pour une plainte spécifique
router.get("/complaint/:complaintId", summon_controller_1.getSummonsByComplaint);
// 🔹 Mettre à jour le statut d'une convocation
router.patch("/:id/status", summon_controller_1.updateSummonStatus);
exports.default = router;
