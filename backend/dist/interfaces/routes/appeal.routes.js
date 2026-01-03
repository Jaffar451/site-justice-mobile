"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appeal_controller_1 = require("../controllers/appeal.controller");
const router = (0, express_1.Router)();
router.post("/", appeal_controller_1.createAppeal);
router.get("/", appeal_controller_1.getAppeals);
exports.default = router;
