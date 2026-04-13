"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePushToken = exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = exports.updateMe = exports.getMe = exports.listUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const env_1 = require("../../config/env");
const PUBLIC_FIELDS = {
    attributes: { exclude: ["password"] },
};
// Accès correct à BCRYPT_ROUNDS (ajustez selon votre structure réelle dans env.ts)
const BCRYPT_ROUNDS = env_1.env.security?.bcryptRounds || 10;
const listUsers = async (req, res) => {
    try {
        const users = await user_model_1.default.findAll(PUBLIC_FIELDS);
        return res.json(users);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.listUsers = listUsers;
const getMe = async (req, res) => {
    try {
        const userReq = req;
        if (!userReq.user)
            return res.status(401).json({ message: "Non authentifié" });
        const user = await user_model_1.default.findByPk(userReq.user.id, PUBLIC_FIELDS);
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        const userReq = req;
        if (!userReq.user)
            return res.status(401).json({ message: "Non authentifié" });
        const user = await user_model_1.default.findByPk(userReq.user.id);
        if (!user)
            return res.status(404).json({ message: "Utilisateur introuvable" });
        const allowed = {};
        if (req.body.firstname)
            allowed.firstname = req.body.firstname;
        if (req.body.lastname)
            allowed.lastname = req.body.lastname;
        if (req.body.password)
            allowed.password = await bcryptjs_1.default.hash(req.body.password, BCRYPT_ROUNDS);
        await user.update(allowed);
        const out = await user_model_1.default.findByPk(user.id, PUBLIC_FIELDS);
        return res.json(out);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateMe = updateMe;
const createUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role, matricule, poste } = req.body;
        if (!firstname || !lastname || !email || !password)
            return res.status(400).json({ message: "Champs requis manquants" });
        const exists = await user_model_1.default.findOne({ where: { email } });
        if (exists)
            return res.status(409).json({ message: "Email déjà utilisé" });
        const hash = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
        const user = await user_model_1.default.create({
            firstname, lastname, email, password: hash,
            role: role?.toLowerCase() || "citizen",
            matricule: matricule || null,
            poste: poste || null,
        });
        const out = await user_model_1.default.findByPk(user.id, PUBLIC_FIELDS);
        return res.status(201).json(out);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.createUser = createUser;
const getUser = async (req, res) => {
    try {
        // Fix : Force le typage de req.params.id en string
        const userId = req.params.id;
        const user = await user_model_1.default.findByPk(userId, PUBLIC_FIELDS);
        if (!user)
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_model_1.default.findByPk(userId);
        if (!user)
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        const updates = {};
        if (req.body.firstname)
            updates.firstname = req.body.firstname;
        if (req.body.lastname)
            updates.lastname = req.body.lastname;
        if (req.body.role)
            updates.role = req.body.role.toLowerCase();
        if (req.body.matricule)
            updates.matricule = req.body.matricule;
        if (req.body.poste)
            updates.poste = req.body.poste;
        await user.update(updates);
        const out = await user_model_1.default.findByPk(user.id, PUBLIC_FIELDS);
        return res.json(out);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_model_1.default.findByPk(userId);
        if (!user)
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        await user.destroy();
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteUser = deleteUser;
const updatePushToken = async (req, res) => {
    try {
        const userReq = req;
        if (!userReq.user)
            return res.status(401).json({ message: "Non authentifié" });
        const { token } = req.body;
        if (!token)
            return res.status(400).json({ message: "Token requis" });
        const user = await user_model_1.default.findByPk(userReq.user.id);
        if (!user)
            return res.status(404).json({ message: "Utilisateur introuvable" });
        // Assurez-vous que votre modèle User possède un champ pushToken
        await user.update({ pushToken: token });
        return res.json({ message: "Token mis à jour avec succès" });
    }
    catch (error) {
        console.error("Error in updatePushToken:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updatePushToken = updatePushToken;
