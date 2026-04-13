"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const custody_controller_1 = require("../controllers");
const router = (0, express_1.Router)();
// ⚠️ ORDRE IMPORTANT : Les routes spécifiques AVANT les routes paramétrées
router.post("/", custody_controller_1.createCustody);
router.get("/active", custody_controller_1.getActiveCustodies); // ⬅️ AVANT "/"
router.get("/", custody_controller_1.getAllCustodies);
router.get("/:id", custody_controller_1.getCustody); // ⬅️ APRÈS "/active"
router.put("/:id", custody_controller_1.updateCustody);
router.delete("/:id", custody_controller_1.deleteCustody);
exports.default = router;
