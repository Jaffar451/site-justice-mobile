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
exports.default = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const env_1 = require("../config/env"); // Import validated environment variables
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token)
                return res.status(401).json({ message: "Token manquant" });
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET); // Use the validated secret
            const user = yield user_model_1.default.findByPk(decoded.id, {
                attributes: { exclude: ["password"] },
            });
            if (!user) {
                return res.status(401).json({ message: "Utilisateur introuvable" });
            }
            req.user = user;
            return next();
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                console.error("❌ Erreur de token JWT:", err.message);
            }
            return res.status(401).json({ message: "Token invalide" });
        }
    });
}
