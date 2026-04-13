"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/lawyer.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
// ✅ Importation groupée depuis le même fichier
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new controllers_1.LawyerController();
router.get('/tracking', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['LAWYER']), (req, res) => controller.getMyTracking(req, res));
exports.default = router;
