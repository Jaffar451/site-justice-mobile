"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/rateLimiter.middleware.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // ⏱️ 1 minute
    max: 5, // 🚫 max 5 tentatives par minute
    message: {
        message: "Trop de tentatives, réessayez plus tard.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.default = loginLimiter;
