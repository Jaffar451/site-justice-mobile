"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/detention.routes.ts
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.post("/", controllers_1.createDetention);
router.get("/", controllers_1.getAllDetentions);
router.get("/:id", controllers_1.getDetention);
router.put("/:id", controllers_1.updateDetention);
router.delete("/:id", controllers_1.deleteDetention);
exports.default = router;
