"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const witness_controller_1 = require("../controllers/witness.controller");
const router = (0, express_1.Router)();
router.post("/", witness_controller_1.createWitness);
router.get("/", witness_controller_1.getWitnesses);
exports.default = router;
