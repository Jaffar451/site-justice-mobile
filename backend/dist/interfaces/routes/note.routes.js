"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const note_controller_1 = require("../controllers/note.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
// 🔹 Lecture notes du dossier
router.get("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "clerk", "judge", "admin"), note_controller_1.listNotes);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "clerk", "judge", "admin"), note_controller_1.getNote);
// 🔹 Création note interne
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "clerk", "judge", "admin"), note_controller_1.createNote);
// 🔹 Modification (contrôlée dans controller)
router.put("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "clerk", "judge", "admin"), note_controller_1.updateNote);
// 🔹 Suppression définitive → admin only
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), note_controller_1.deleteNote);
exports.default = router;
