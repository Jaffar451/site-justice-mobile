"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/audit.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * 🕵️ ACCÈS AUX JOURNAUX D'AUDIT
 * Réservé exclusivement aux administrateurs pour la conformité et la sécurité.
 */
router.get("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)(['admin', 'super-admin']), // ✅ On autorise aussi le super-admin si présent
controllers_1.getAuditLogs);
exports.default = router;
