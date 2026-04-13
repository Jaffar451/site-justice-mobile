"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

// PATH: src/interfaces/routes/complaint.routes.ts

const express_1 = require("express");
const complaint_controller_1 = require("../controllers/complaint.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");

const router = (0, express_1.Router)();

// 📌 Citizen : créer + consulter uniquement ses plaintes
router.post(
    "/",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("citizen"),
    complaint_controller_1.createComplaint
);

router.get(
    "/me",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("citizen"),
    complaint_controller_1.listMyComplaints
);

router.get(
    "/mine",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("citizen"),
    complaint_controller_1.listMyComplaints
);

// 📌 Lecture de plainte par autorité judiciaire
router.get(
    "/:id",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("police", "clerk", "judge", "admin"),
    complaint_controller_1.getComplaint
);

// 📌 Liste globale (Police / Greffe / Juge / Admin)
router.get(
    "/",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("police", "clerk", "judge", "admin"),
    complaint_controller_1.listComplaints
);

// 📌 Mise à jour — Police, Greffe & Procureur
router.put(
    "/:id",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("police", "clerk", "prosecutor"),
    complaint_controller_1.updateComplaint
);

// 📌 Suppression — Admin only (trace de contrôle)
router.delete(
    "/:id",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("admin"),
    complaint_controller_1.deleteComplaint
);

// ✅ 📌 TRANSMISSION DE PLAINTE (AJOUTÉ)
router.post(
    "/:id/transmit",
    auth_middleware_1.default,
    (0, role_middleware_1.requireRole)("police", "clerk", "prosecutor"),
    complaint_controller_1.transmitComplaint
);

exports.default = router;