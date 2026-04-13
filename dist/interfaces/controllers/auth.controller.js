"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuperAdmin = exports.me = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
// Importation des modèles (avec export default dans le fichier source, donc import sans accolades)
const user_model_1 = __importDefault(require("../../models/user.model"));
const refreshToken_model_1 = __importDefault(require("../../models/refreshToken.model"));
const auth_schema_1 = require("../../schemas/auth.schema");
const env_1 = require("../../config/env");
// Extraction des configurations JWT
const { secret: JWT_SECRET, refreshSecret: REFRESH_SECRET, expiration: JWT_EXPIRES_IN, refreshExpiration: REFRESH_EXPIRES_IN } = env_1.env.jwt;
// Fonctions utilitaires pour générer les tokens
const signToken = (user) => jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
});
const signRefresh = (user) => jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
});
const publicUser = (u) => ({
    id: u.id,
    firstname: u.firstname,
    lastname: u.lastname,
    email: u.email,
    role: u.role.toLowerCase(),
});
// Contrôleurs exportés
const register = async (req, res) => {
    try {
        const body = auth_schema_1.registerSchema.parse(req.body);
        const exists = await user_model_1.default.findOne({ where: { email: body.email } });
        if (exists)
            return res.status(409).json({ message: "Email déjà utilisé" });
        const hashedPass = await bcryptjs_1.default.hash(body.password, 10);
        const user = await user_model_1.default.create({ ...body, password: hashedPass, role: "citizen" });
        return res.status(201).json(publicUser(user));
    }
    catch (error) {
        return res.status(400).json({ message: "Données d'inscription invalides" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const LOCK_DURATION_MIN = 15;
    const MAX_ATTEMPTS = 5;
    try {
        const body = auth_schema_1.loginSchema.parse(req.body);
        // Cast en 'any' pour éviter les erreurs de type sur les champs ajoutés manuellement
        const user = await user_model_1.default.findOne({
            where: { [sequelize_1.Op.or]: [{ email: body.email }, { matricule: body.email }] }
        });
        if (!user)
            return res.status(401).json({ message: "Identifiants invalides" });
        if (user.lockUntil && user.lockUntil > new Date()) {
            return res.status(403).json({ message: "Compte verrouillé." });
        }
        const ok = await bcryptjs_1.default.compare(body.password, user.password);
        if (!ok) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            if (user.failedAttempts >= MAX_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_DURATION_MIN * 60 * 1000);
            }
            await user.save();
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        user.failedAttempts = 0;
        user.lockUntil = null;
        await user.save();
        const token = signToken(user);
        const refresh = signRefresh(user);
        await refreshToken_model_1.default.destroy({ where: { userId: user.id } });
        await refreshToken_model_1.default.create({ userId: user.id, token: refresh });
        return res.json({ token, refresh, user: publicUser(user) });
    }
    catch (err) {
        return res.status(400).json({ message: "Requête invalide" });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refresh } = req.body;
        if (!refresh)
            return res.status(401).json({ message: "Missing refresh" });
        const decoded = jsonwebtoken_1.default.verify(refresh, REFRESH_SECRET);
        const user = await user_model_1.default.findByPk(decoded.id);
        if (!user)
            return res.status(401).json({ message: "Invalid refresh" });
        return res.json({ token: signToken(user) });
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.refreshToken = refreshToken;
const me = async (req, res) => {
    // @ts-ignore : permet de récupérer user depuis le middleware d'authentification
    if (req.user)
        return res.json(publicUser(req.user));
    return res.status(401).json({ message: "Non authentifié" });
};
exports.me = me;
const createSuperAdmin = async (req, res) => {
    // Logique pour créer un admin si besoin
    return res.status(501).json({ message: "Non implémenté" });
};
exports.createSuperAdmin = createSuperAdmin;
