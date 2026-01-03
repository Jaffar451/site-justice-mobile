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
exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = exports.updateMe = exports.getMe = exports.listUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const env_1 = require("../../config/env");
const PUBLIC_FIELDS = {
    attributes: { exclude: ["password"] },
};
/**
 * GET /api/users
 * ADMIN uniquement
 */
const listUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.findAll(PUBLIC_FIELDS);
        return res.json(users);
    }
    catch (error) {
        console.error("Error in listUsers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listUsers = listUsers;
/**
 * GET /api/users/me
 * Profil personnel
 */
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Non authentifié" });
        const user = yield user_model_1.default.findByPk(req.user.id, PUBLIC_FIELDS);
        return res.json(user);
    }
    catch (error) {
        console.error("Error in getMe:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMe = getMe;
/**
 * PUT /api/users/me
 * Mise à jour personnelle
 */
const updateMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Non authentifié" });
        const user = yield user_model_1.default.findByPk(req.user.id);
        if (!user)
            return res.status(404).json({ message: "Utilisateur introuvable" });
        const allowed = {};
        if (req.body.firstname)
            allowed.firstname = req.body.firstname;
        if (req.body.lastname)
            allowed.lastname = req.body.lastname;
        if (req.body.password)
            allowed.password = yield bcrypt_1.default.hash(req.body.password, env_1.env.BCRYPT_ROUNDS);
        yield user.update(allowed);
        const out = yield user_model_1.default.findByPk(user.id, PUBLIC_FIELDS);
        return res.json(out);
    }
    catch (error) {
        console.error("Error in updateMe:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateMe = updateMe;
/**
 * POST /api/users
 * ADMIN → création d’un compte interne
 */
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, email, password, role, matricule, poste } = req.body;
        if (!firstname || !lastname || !email || !password)
            return res.status(400).json({ message: "Champs requis manquants" });
        const exists = yield user_model_1.default.findOne({ where: { email } });
        if (exists)
            return res.status(409).json({ message: "Email déjà utilisé" });
        const hash = yield bcrypt_1.default.hash(password, env_1.env.BCRYPT_ROUNDS);
        const user = yield user_model_1.default.create({
            firstname,
            lastname,
            email,
            password: hash,
            role: (role === null || role === void 0 ? void 0 : role.toLowerCase()) || "citizen",
            matricule: matricule || null,
            poste: poste || null,
        });
        const out = yield user_model_1.default.findByPk(user.id, PUBLIC_FIELDS);
        return res.status(201).json(out);
    }
    catch (error) {
        console.error("Error in createUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createUser = createUser;
/**
 * GET /api/users/:id
 * ADMIN
 */
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findByPk(req.params.id, PUBLIC_FIELDS);
        if (!user)
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        return res.json(user);
    }
    catch (error) {
        console.error("Error in getUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUser = getUser;
/**
 * PATCH /api/users/:id
 * ADMIN → mise à jour rôle / infos internes
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findByPk(req.params.id);
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
        yield user.update(updates);
        const out = yield user_model_1.default.findByPk(user.id, PUBLIC_FIELDS);
        return res.json(out);
    }
    catch (error) {
        console.error("Error in updateUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUser = updateUser;
/**
 * DELETE /api/users/:id
 * ADMIN
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        yield user.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteUser = deleteUser;
