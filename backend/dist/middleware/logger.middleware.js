"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loggerMiddleware;
exports.loggerMiddleware = loggerMiddleware;
const log_model_1 = __importDefault(require("../models/log.model"));
function loggerMiddleware(req, _res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const user = req.user;
        const method = req.method || "GET";
        const ip = (_a = req.ip) !== null && _a !== void 0 ? _a : "unknown_ip";
        yield log_model_1.default.create({
            userId: user ? user.id : null,
            action: `API Call`,
            method,
            endpoint: req.originalUrl,
            ip,
        }).catch((err) => {
            console.error("Erreur LoggerMiddleware:", err.message);
        });
        next();
    });
}
