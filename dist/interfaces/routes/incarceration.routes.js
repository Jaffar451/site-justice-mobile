"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incarcerationController = __importStar(require("../controllers"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * 🔒 PROTECTION GLOBALE
 * Toutes les routes ci-dessous nécessitent une authentification
 * et sont réservées aux admins et au personnel pénitentiaire.
 */
const prisonAccess = [auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin", "prison_officer"])];
// POST /api/incarcerations/entry -> Enregistrer une nouvelle mise sous écrou
router.post("/entry", prisonAccess, incarcerationController.registerEntry);
// GET /api/incarcerations/inmates -> Consulter le registre d'écrou (liste des détenus présents)
router.get("/inmates", prisonAccess, incarcerationController.listInmates);
// PATCH /api/incarcerations/:id/release -> Procéder à une levée d'écrou (libération)
router.patch("/:id/release", prisonAccess, incarcerationController.releaseDetainee);
// POST /api/incarcerations/:id/transfer -> Transférer un détenu vers un autre établissement
router.post("/:id/transfer", prisonAccess, incarcerationController.transferDetainee);
exports.default = router;
