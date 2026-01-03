"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const release_controller_1 = require("../controllers/release.controller");
const router = (0, express_1.Router)();
router.post("/", release_controller_1.createRelease);
router.get("/", release_controller_1.getReleases);
exports.default = router;
