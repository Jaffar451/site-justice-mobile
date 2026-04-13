"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/notification.routes.ts
const express_1 = require("express");
// 👇 On importe toutes les fonctions exportées
const NotificationController = __importStar(require("../controllers"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ❌ ON SUPPRIME : const controller = new NotificationController();
// Car ce n'est plus une classe, mais des fonctions directes.
// Toutes les routes nécessitent d'être connecté
router.use(auth_middleware_1.authenticate);
// Lecture
router.get("/", NotificationController.getNotifications);
router.patch("/:id/read", NotificationController.markAsRead);
// Suppression
// ✅ IMPORTANT : La route "/all" doit être déclarée AVANT "/:id"
// Sinon Express pensera que "all" est un ID.
router.delete("/all", NotificationController.clearAll);
// ✅ AJOUT : Route pour supprimer une seule notification
router.delete("/:id", NotificationController.deleteNotification);
exports.default = router;
