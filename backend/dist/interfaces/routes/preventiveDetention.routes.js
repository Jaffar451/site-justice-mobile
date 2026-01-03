"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preventiveDetention_controller_1 = require("../controllers/preventiveDetention.controller");
const router = (0, express_1.Router)();
router.post("/", preventiveDetention_controller_1.createPreventiveDetention);
router.get("/", preventiveDetention_controller_1.getAllPreventiveDetentions);
exports.default = router;
