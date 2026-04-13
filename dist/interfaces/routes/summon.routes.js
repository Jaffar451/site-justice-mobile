"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/summon.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
// 👇 1. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 📌 Toutes les routes nécessitent une authentification
// 👇 2. CORRECTION : On utilise la variable importée 'authenticate'
router.use(auth_middleware_1.authenticate);
// 🔹 Créer une convocation (Police, Juge, Greffier)
router.post("/", (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "admin"]), controllers_1.createSummon);
// 🔹 Lister toutes les convocations
router.get("/", (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "prosecutor", "admin"]), controllers_1.listSummons);
// 🔹 Lister les convocations pour une plainte spécifique
router.get("/complaint/:complaintId", (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "prosecutor", "admin"]), controllers_1.getSummonsByComplaint);
// 🔹 Mettre à jour le statut (ex: 'distribuée', 'signée')
router.patch("/:id/status", (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "admin"]), controllers_1.updateSummonStatus);
exports.default = router;
