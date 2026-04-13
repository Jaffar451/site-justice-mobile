"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'prosecutor', 'commissaire']), controllers_1.getDashboardStats);
router.get('/trends', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'prosecutor', 'commissaire', 'judge']), controllers_1.getMonthlyTrends);
exports.default = router;
