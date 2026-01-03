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
exports.deletePreventiveDetention = exports.updatePreventiveDetention = exports.getPreventiveDetentionById = exports.getAllPreventiveDetentions = exports.createPreventiveDetention = void 0;
const preventiveDetention_model_1 = __importDefault(require("../../models/preventiveDetention.model"));
const createPreventiveDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detention = yield preventiveDetention_model_1.default.create(req.body);
        return res.status(201).json(detention);
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur lors de la création de la détention préventive." });
    }
});
exports.createPreventiveDetention = createPreventiveDetention;
const getAllPreventiveDetentions = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detentions = yield preventiveDetention_model_1.default.findAll();
        return res.json(detentions);
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération des détentions." });
    }
});
exports.getAllPreventiveDetentions = getAllPreventiveDetentions;
const getPreventiveDetentionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detention = yield preventiveDetention_model_1.default.findByPk(req.params.id);
        if (!detention)
            return res.status(404).json({ error: "Détention non trouvée." });
        return res.json(detention);
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération." });
    }
});
exports.getPreventiveDetentionById = getPreventiveDetentionById;
const updatePreventiveDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [updated] = yield preventiveDetention_model_1.default.update(req.body, {
            where: { id: req.params.id },
        });
        if (!updated)
            return res.status(404).json({ error: "Détention non trouvée." });
        const updatedDetention = yield preventiveDetention_model_1.default.findByPk(req.params.id);
        return res.json(updatedDetention);
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
});
exports.updatePreventiveDetention = updatePreventiveDetention;
const deletePreventiveDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield preventiveDetention_model_1.default.destroy({ where: { id: req.params.id } });
        if (!deleted)
            return res.status(404).json({ error: "Détention non trouvée." });
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
});
exports.deletePreventiveDetention = deletePreventiveDetention;
