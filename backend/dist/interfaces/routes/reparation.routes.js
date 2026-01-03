"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reparation_controller_1 = require("../controllers/reparation.controller");
const router = (0, express_1.Router)();
router.post("/", reparation_controller_1.createReparation);
router.get("/", reparation_controller_1.getReparations);
exports.default = router;
