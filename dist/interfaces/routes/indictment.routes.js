"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/indictment.routes.ts
const express_1 = require("express");
// 👇 1. Import du contrôleur
const controllers_1 = require("../controllers");
// 👇 2. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 📌 Création — uniquement par les juges (et Admin pour debug)
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "admin"]), controllers_1.createIndictment);
// 📌 Lecture — Authentifié requis (contrôleur peut filtrer plus si besoin)
router.get("/:id", auth_middleware_1.authenticate, controllers_1.getIndictment);
// 📌 Mise à jour — uniquement juges
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "admin"]), controllers_1.updateIndictment);
// 📌 Suppression — uniquement admin
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteIndictment);
exports.default = router;
