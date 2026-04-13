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
// PATH: src/interfaces/routes/policeStation.routes.ts
const express_1 = require("express");
// 👇 On importe tout en tant que "StationController" (pas de classe)
const StationController = __importStar(require("../controllers"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ==========================================
// 🔓 ROUTES ACCESSIBLES (Citoyens & Police)
// ==========================================
/**
 * @route   GET /api/police-stations
 * @desc    Récupérer la liste (Pour l'annuaire mobile)
 */
router.get('/', auth_middleware_1.authenticate, StationController.getAllStations);
/**
 * @route   GET /api/police-stations/:id
 * @desc    Détails d'un commissariat
 */
router.get('/:id', auth_middleware_1.authenticate, StationController.getStationById);
// ==========================================
// 🔒 ROUTES ADMIN (GESTION)
// ==========================================
/**
 * @route   POST /api/police-stations
 * @desc    Créer un commissariat
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), StationController.createStation);
/**
 * @route   PUT /api/police-stations/:id
 * @desc    Modifier
 */
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), StationController.updateStation);
/**
 * @route   DELETE /api/police-stations/:id
 * @desc    Supprimer
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), StationController.deleteStation);
exports.default = router;
