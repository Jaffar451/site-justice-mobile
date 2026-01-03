"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/detention.routes.ts
const express_1 = require("express");
const detention_controller_1 = require("../controllers/detention.controller");
const router = (0, express_1.Router)();
router.post("/", detention_controller_1.createDetention);
router.get("/", detention_controller_1.getAllDetentions);
router.get("/:id", detention_controller_1.getDetention);
router.put("/:id", detention_controller_1.updateDetention);
router.delete("/:id", detention_controller_1.deleteDetention);
exports.default = router;
