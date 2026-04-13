"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/note.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
// 👇 1. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 🔹 Lecture notes (liste globale ou filtrée)
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "clerk", "judge", "admin"]), controllers_1.listNotes);
// 🔹 Lecture une note
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "clerk", "judge", "admin"]), controllers_1.getNote);
// 🔹 Création note interne
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "clerk", "judge", "admin"]), controllers_1.createNote);
// 🔹 Modification (Seul l'auteur peut modifier, géré dans le controller)
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "clerk", "judge", "admin"]), controllers_1.updateNote);
// 🔹 Suppression définitive → admin only
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteNote);
exports.default = router;
