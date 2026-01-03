"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sentence_controller_1 = require("../controllers/sentence.controller");
const router = (0, express_1.Router)();
router.post("/", sentence_controller_1.createSentence);
router.get("/", sentence_controller_1.getSentences);
exports.default = router;
