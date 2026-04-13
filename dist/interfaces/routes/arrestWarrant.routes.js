"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/arrestWarrant.routes.ts
const express_1 = require("express");
// 👇 1. Imports du contrôleur
const controllers_1 = require("../controllers");
// 👇 2. Imports des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
// Je commente ceci pour éviter le crash tant que ce middleware n'est pas mis à jour
// import { requireAssignmentRole } from "../../middleware/assignment.middleware";
const router = (0, express_1.Router)();
// Seul un juge (d'instruction) peut créer un mandat d'arrêt
router.post("/", auth_middleware_1.authenticate, 
// On remplace requireAssignmentRole par authorize(["judge"]) temporairement
(0, auth_middleware_1.authorize)(["judge", "admin"]), controllers_1.createArrestWarrant);
// Seuls les agents judiciaires peuvent voir les mandats
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "prosecutor", "judge", "clerk", "admin"]), controllers_1.getArrestWarrants);
exports.default = router;
