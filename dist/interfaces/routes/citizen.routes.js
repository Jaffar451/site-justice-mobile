"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new controllers_1.CitizenController();
/**
 * @route   GET /api/citizen/cases
 * @desc    Récupérer tous les dossiers judiciaires liés au citoyen connecté
 * @access  Privé (Citizen uniquement)
 */
router.get('/cases', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['citizen']), (req, res) => controller.getDashboard(req, res));
/**
 * @route   GET /api/citizen/notifications
 * @desc    Récupérer les alertes (significations d'actes, dates d'audiences)
 * @access  Privé (Citizen uniquement)
 */
router.get('/notifications', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['citizen']), (req, res) => controller.getNotifications(req, res));
/**
 * @route   GET /api/citizen/summons
 * @desc    Voir les convocations reçues
 */
router.get('/summons', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['citizen']), (req, res) => {
    // Tu pourras ajouter une méthode getMySummons dans le controller plus tard
    res.status(501).json({ message: "Non implémenté : liste des convocations" });
});
exports.default = router;
