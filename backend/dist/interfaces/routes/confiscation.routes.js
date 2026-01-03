"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const confiscation_controller_1 = require("../controllers/confiscation.controller");
const router = (0, express_1.Router)();
router.post("/", confiscation_controller_1.createConfiscation);
router.get("/", confiscation_controller_1.getConfiscations);
exports.default = router;
