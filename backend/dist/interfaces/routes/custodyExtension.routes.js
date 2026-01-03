"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const custodyExtension_controller_1 = require("../controllers/custodyExtension.controller");
const router = (0, express_1.Router)();
router.post("/", custodyExtension_controller_1.createCustodyExtension);
router.get("/", custodyExtension_controller_1.getCustodyExtensions);
exports.default = router;
