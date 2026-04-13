"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/dashboard.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
// import { protect, restrictTo } from "../../middlewares/auth.middleware"; // À activer plus tard pour la sécurité
const router = (0, express_1.Router)();
/**
 * @route   GET /api/dashboard/prisons
 * @desc    Obtenir les statistiques de population et de capacité carcérale
 * @access  Privé (Admin/Ministère)
 */
router.get("/prisons", controllers_1.getPrisonStats);
/**
 * @route   GET /api/dashboard/police
 * @desc    Obtenir le volume des plaintes par commissariat/brigade
 * @access  Privé (Admin/Ministère)
 */
router.get("/police", controllers_1.getPoliceStats);
exports.default = router;
