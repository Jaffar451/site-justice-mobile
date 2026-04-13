"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/witness.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
// 👇 Import de la sécurité
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 📌 AJOUTER UN TÉMOIN (Police, Juge, Greffier)
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "admin"]), controllers_1.createWitness);
// 📌 LISTER LES TÉMOINS (Justice + Admin)
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "prosecutor", "admin"]), controllers_1.getWitnesses);
exports.default = router;
