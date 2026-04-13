"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
// ✅ Import avec le chemin exact vers le dossier "middleware"
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new controllers_1.BailiffController();
/**
 * Route : Récupérer les missions de l'huissier
 * URL : GET /api/bailiff/missions
 */
router.get('/missions', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['bailiff']), (req, res) => controller.getMyMissions(req, res));
/**
 * Route : Valider une signification avec coordonnées GPS
 * URL : POST /api/bailiff/signify
 */
router.post('/signify', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['bailiff']), (req, res) => controller.validateMission(req, res));
exports.default = router;
