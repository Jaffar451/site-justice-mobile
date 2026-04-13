"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/decision.routes.ts
const express_1 = require("express");
// 👇 1. Import des fonctions du contrôleur
const controllers_1 = require("../controllers");
// 👇 2. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 🔹 Liste des décisions (Tout agent de justice)
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "clerk", "police", "admin"]), controllers_1.listDecisions);
// 🔹 Liste par affaire
router.get("/case/:caseId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "clerk", "police", "admin"]), controllers_1.listDecisionsByCase);
// 🔹 Création décision : juge uniquement
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "admin"]), // J'ai ajouté admin pour tes tests
controllers_1.createDecision);
// 🔹 Lecture décision
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "clerk", "police", "admin"]), controllers_1.getDecision);
// 🔹 Modification décision : si non signée
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge"]), controllers_1.updateDecision);
// 🔹 Signature (Scellement de la décision)
router.patch("/:id/sign", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge"]), controllers_1.signDecision);
// 🔹 Suppression décision : admin uniquement
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteDecision);
exports.default = router;
