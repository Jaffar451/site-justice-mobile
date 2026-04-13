"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * ⚖️ DROITS D'ACCÈS
 * - Consultation : Juges, Greffiers, Procureurs, Police (pour suivi), Admin
 * - Modification/Création : Juges et Admins uniquement
 */
const judicialStaff = ["judge", "clerk", "police", "prosecutor", "admin"];
const magistrateOnly = ["judge", "admin"];
// 📌 LISTER LES PEINES
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(judicialStaff), controllers_1.getSentences);
// 📌 VOIR LE DÉTAIL D'UNE PEINE
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(judicialStaff), controllers_1.getSentence);
// 📌 ENREGISTRER UNE NOUVELLE PEINE (Prononcé du jugement)
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(magistrateOnly), controllers_1.createSentence);
// 📌 MODIFIER UNE PEINE (Rectification d'erreur matérielle)
router.patch("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(magistrateOnly), controllers_1.updateSentence);
// 📌 SUPPRIMER UNE PEINE (Action critique)
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["admin"]), controllers_1.deleteSentence);
exports.default = router;
