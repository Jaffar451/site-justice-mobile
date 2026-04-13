"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// --- ACCÈS GÉNÉRAL (Consultation) ---
const judicialStaff = ["judge", "clerk", "police", "prosecutor", "admin"];
// 📌 RÔLE D'AUDIENCE DU JOUR (Placé avant /:id)
router.get("/daily-roll", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(judicialStaff), controllers_1.getDailyRoll);
// 📌 LISTER TOUTES LES AUDIENCES (Calendrier global ou filtré par tribunal)
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(judicialStaff), controllers_1.listHearings);
// 📌 HISTORIQUE DES AUDIENCES D'UNE AFFAIRE SPÉCIFIQUE
router.get("/case/:caseId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(judicialStaff), controllers_1.listHearingsByCase);
// 📌 VOIR UNE AUDIENCE PRÉCISE
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(judicialStaff), controllers_1.getHearing);
// --- ACCÈS RESTREINT (Gestion) ---
// 📌 PLANIFIER (Juge + Greffier)
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "clerk", "admin"]), controllers_1.createHearing);
// 📌 MODIFIER / AJOURNER (Juge + Greffier)
router.patch("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["judge", "clerk", "admin"]), controllers_1.updateHearing);
// 📌 SUPPRIMER (Admin uniquement)
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteHearing);
exports.default = router;
