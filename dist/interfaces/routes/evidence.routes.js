"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/evidence.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
// 👇 1. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
// 👇 2. Si tu as ce middleware, décommente-le. Sinon, laisse commenté pour éviter le crash.
// import { uploadEvidence } from "../../middleware/upload-evidence.middleware";
const router = (0, express_1.Router)();
// Lecture → Police / Juge / Greffier / Procureur / Admin
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "prosecutor", "admin"]), controllers_1.listEvidence);
// Création → Police uniquement (avec upload si disponible)
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police"]), 
// uploadEvidence, // Décommente si le fichier existe
controllers_1.createEvidence);
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "admin"]), controllers_1.getEvidence);
// Modification → Police ou Juge
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge"]), controllers_1.updateEvidence);
// Suppression → Admin
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteEvidence);
exports.default = router;
