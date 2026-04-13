"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/assignment.routes.ts
const express_1 = require("express");
// 👇 1. Import des fonctions du contrôleur
const controllers_1 = require("../controllers");
// 👇 2. Import des middlewares standards
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 📌 LISTE : Admin + Agents de justice
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin", "police", "prosecutor", "judge", "clerk"]), controllers_1.listAssignments);
// 📌 CRÉATION : Police + Procureur + Admin
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "prosecutor", "admin"]), controllers_1.createAssignment);
// 📌 CONSULTATION : Admin + Agents de justice
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin", "police", "prosecutor", "judge", "clerk"]), controllers_1.getAssignment);
// 📌 MISE À JOUR : Police + Procureur + Juge + Admin
router.put(// ou patch
"/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["police", "prosecutor", "judge", "admin"]), controllers_1.updateAssignment);
// 📌 SUPPRESSION : Admin uniquement
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteAssignment);
exports.default = router;
