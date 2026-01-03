"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/interrogation.routes.ts
const express_1 = require("express");
const interrogation_controller_1 = require("../controllers/interrogation.controller");
const router = (0, express_1.Router)();
router.post("/", interrogation_controller_1.createInterrogation);
router.get("/", interrogation_controller_1.getAllInterrogations);
router.get("/:id", interrogation_controller_1.getInterrogation);
router.put("/:id", interrogation_controller_1.updateInterrogation);
router.delete("/:id", interrogation_controller_1.deleteInterrogation);
exports.default = router;
