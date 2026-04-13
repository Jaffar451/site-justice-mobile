"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const qualification_routes_1 = __importDefault(require("./qualification.routes"));
const procedural_routes_1 = __importDefault(require("./procedural.routes"));
const caseParty_routes_1 = __importDefault(require("./caseParty.routes"));
const router = (0, express_1.Router)();
// ==========================================
// SOUS-ROUTES PAR DOSSIER
// ==========================================
// /api/cases/:caseId/qualification
router.use("/:caseId/qualification", qualification_routes_1.default);
// /api/cases/:caseId/procedural
router.use("/:caseId/procedural", procedural_routes_1.default);
// /api/cases/:caseId/parties
router.use("/:caseId/parties", caseParty_routes_1.default);
// ==========================================
// ROUTES PRINCIPALES
// ==========================================
router.get("/me", auth_middleware_1.authenticate, controllers_1.listMyCases);
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.listCases);
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["prosecutor", "admin"]), controllers_1.createCase);
router.get("/:id", auth_middleware_1.authenticate, controllers_1.getCase);
// PATCH — transitions de stage via CaseService
router.patch("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "prosecutor", "greffier", "admin"]), controllers_1.updateCase);
// PUT — alias pour compatibilité avec l'existant
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "prosecutor", "greffier", "admin"]), controllers_1.updateCase);
exports.default = router;
