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
exports.deleteAssignment = exports.updateAssignment = exports.getAssignment = exports.createAssignment = exports.listAssignments = void 0;
const assignment_model_1 = __importDefault(require("../../models/assignment.model"));
const case_model_1 = __importDefault(require("../../models/case.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
/**
 * LISTE ➜ Autorisé : Admin + Justice Agents
 */
const listAssignments = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield assignment_model_1.default.findAll({
        include: [
            { model: case_model_1.default, attributes: ["id", "reference", "stage"] },
            { model: user_model_1.default, attributes: ["id", "firstname", "lastname", "role"] },
        ],
        order: [["assignedAt", "DESC"]],
    });
    return res.json(items);
});
exports.listAssignments = listAssignments;
/**
 * CRÉATION ➜ Police + Procureur + Admin
 * - Ajoute un acteur judiciaire au dossier
 */
const createAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { caseId, userId, role } = req.body;
        if (!caseId || !userId || !role) {
            return res.status(400).json({ message: "Champs manquants" });
        }
        const item = yield assignment_model_1.default.create({
            caseId,
            userId,
            role,
            assignedAt: new Date(),
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Erreur createAssignment:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.createAssignment = createAssignment;
/**
 * CONSULTATION
 */
const getAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield assignment_model_1.default.findByPk(req.params.id, {
        include: [{ model: user_model_1.default }, { model: case_model_1.default }],
    });
    if (!item)
        return res.status(404).json({ message: "Affectation introuvable" });
    return res.json(item);
});
exports.getAssignment = getAssignment;
/**
 * MISE À JOUR ➜ Police + Procureur + Juge + Admin
 */
const updateAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield assignment_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Affectation introuvable" });
    yield item.update(req.body);
    return res.json(item);
});
exports.updateAssignment = updateAssignment;
/**
 * SUPPRESSION ➜ Admin uniquement
 */
const deleteAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield assignment_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Affectation introuvable" });
    yield item.destroy();
    return res.status(204).send();
});
exports.deleteAssignment = deleteAssignment;
