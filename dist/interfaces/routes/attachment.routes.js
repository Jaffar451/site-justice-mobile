"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/attachment.routes.ts
const express_1 = require("express");
// 👇 1. Import des fonctions du contrôleur
const controllers_1 = require("../controllers");
// 👇 2. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
// (Optionnel) Si tu utilises Multer pour l'upload de fichiers, tu devras l'importer ici
// import upload from "../../middleware/upload.middleware"; 
const router = (0, express_1.Router)();
// 📌 AJOUTER UNE PIÈCE JOINTE
// (Note: Si tu utilises Multer, ajoute 'upload.single("file")' avant le contrôleur)
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "admin"]), controllers_1.uploadAttachment);
// 📌 LISTER LES PIÈCES D'UN DOSSIER
router.get("/:caseId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "judge", "clerk", "prosecutor", "admin"]), controllers_1.listAttachments);
// 📌 SUPPRIMER UNE PIÈCE
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteAttachment);
exports.default = router;
