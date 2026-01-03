"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/custody.routes.ts
const express_1 = require("express");
const custody_controller_1 = require("../controllers/custody.controller");
const router = (0, express_1.Router)();
router.post("/", custody_controller_1.createCustody);
router.get("/", custody_controller_1.getAllCustodies);
router.get("/:id", custody_controller_1.getCustody);
router.put("/:id", custody_controller_1.updateCustody);
router.delete("/:id", custody_controller_1.deleteCustody);
exports.default = router;
