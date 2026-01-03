"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchWarrant_controller_1 = require("../controllers/searchWarrant.controller");
const router = (0, express_1.Router)();
router.post("/", searchWarrant_controller_1.createSearchWarrant);
router.get("/", searchWarrant_controller_1.getSearchWarrants);
exports.default = router;
