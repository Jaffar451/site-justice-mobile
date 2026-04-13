"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/interrogation.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.post("/", controllers_1.createInterrogation);
router.get("/", controllers_1.getAllInterrogations);
router.get("/:id", controllers_1.getInterrogation);
router.put("/:id", controllers_1.updateInterrogation);
router.delete("/:id", controllers_1.deleteInterrogation);
exports.default = router;
