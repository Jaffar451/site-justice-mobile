"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prosecution_controller_1 = require("../controllers/prosecution.controller");
const router = (0, express_1.Router)();
router.post("/", prosecution_controller_1.createProsecution);
router.get("/", prosecution_controller_1.getProsecutions);
exports.default = router;
