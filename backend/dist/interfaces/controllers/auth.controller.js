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
exports.me = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
// 👇 Import de UserRole nécessaire pour le typage strict
const user_model_1 = __importDefault(require("../../models/user.model"));
const refreshToken_model_1 = __importDefault(require("../../models/refreshToken.model"));
const auth_schema_1 = require("../../schemas/auth.schema");
const env_1 = require("../../config/env");
const { JWT_SECRET, REFRESH_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN } = env_1.env;
// ✅ CORRECTION ICI : On utilise "as any" pour expiresIn
const signToken = (user) => jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN, // TypeScript refuse 'string', on force avec 'any'
});
// ✅ CORRECTION ICI AUSSI
const signRefresh = (user) => jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN, // TypeScript refuse 'string', on force avec 'any'
});
const publicUser = (u) => ({
    id: u.id,
    firstname: u.firstname,
    lastname: u.lastname,
    email: u.email,
    role: u.role.toLowerCase(),
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = auth_schema_1.registerSchema.parse(req.body);
        const exists = yield user_model_1.default.findOne({ where: { email: body.email } });
        if (exists)
            return res.status(409).json({ message: "Email déjà utilisé" });
        const hashedPass = yield bcrypt_1.default.hash(body.password, 10);
        const user = yield user_model_1.default.create(Object.assign(Object.assign({}, body), { password: hashedPass, role: "citizen" }));
        return res.status(201).json(publicUser(user));
    }
    catch (error) {
        console.error("Erreur dans register():", error);
        return res
            .status(400)
            .json({ message: "Données d'inscription invalides" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const LOCK_DURATION_MIN = 15;
    const MAX_ATTEMPTS = 5;
    try {
        const body = auth_schema_1.loginSchema.parse(req.body);
        const identifier = body.email; // Can be email or matricule
        const user = yield user_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ email: identifier }, { matricule: identifier }],
            },
        });
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        // 1. Vérifier si le compte est actuellement verrouillé
        if (user.lockUntil && user.lockUntil > new Date()) {
            return res.status(403).json({
                message: `Compte verrouillé. Réessayez dans ${LOCK_DURATION_MIN} minutes.`,
            });
        }
        const ok = yield bcrypt_1.default.compare(body.password, user.password);
        if (!ok) {
            // 2. Échec de la connexion : incrémenter les tentatives
            user.failedAttempts += 1;
            if (user.failedAttempts >= MAX_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_DURATION_MIN * 60 * 1000);
            }
            yield user.save();
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        // 3. Connexion réussie : réinitialiser les tentatives
        if (user.failedAttempts > 0 || user.lockUntil) {
            user.failedAttempts = 0;
            user.lockUntil = null;
            yield user.save();
        }
        const token = signToken(user);
        const refresh = signRefresh(user);
        yield refreshToken_model_1.default.destroy({ where: { userId: user.id } });
        yield refreshToken_model_1.default.create({ userId: user.id, token: refresh });
        return res.json({
            token,
            refresh,
            user: publicUser(user),
        });
    }
    catch (err) {
        console.error("Erreur dans login():", err);
        return res.status(400).json({ message: "Requête invalide" });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refresh } = req.body;
        if (!refresh)
            return res.status(401).json({ message: "Missing refresh" });
        const decoded = jsonwebtoken_1.default.verify(refresh, REFRESH_SECRET);
        const user = yield user_model_1.default.findByPk(decoded.id);
        if (!user)
            return res.status(401).json({ message: "Invalid refresh" });
        const tokenRecord = yield refreshToken_model_1.default.findOne({
            where: { userId: user.id, token: refresh },
        });
        if (!tokenRecord)
            return res.status(401).json({ message: "Refresh non reconnu" });
        return res.json({ token: signToken(user) });
    }
    catch (_a) {
        return res.status(401).json({ message: "Invalid token" });
    }
});
exports.refreshToken = refreshToken;
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        return res.json(publicUser(req.user));
    }
    return res.status(401).json({ message: "Non authentifié" });
});
exports.me = me;
