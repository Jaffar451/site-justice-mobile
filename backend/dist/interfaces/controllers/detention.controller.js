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
exports.getAllDetentions = exports.deleteDetention = exports.updateDetention = exports.getDetention = exports.createDetention = void 0;
const detention_model_1 = __importDefault(require("../../models/detention.model"));
const createDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detention = yield detention_model_1.default.create(req.body);
        return res.status(201).json(detention);
    }
    catch (error) {
        return res.status(500).json({ error: "Échec de création de la détention" });
    }
});
exports.createDetention = createDetention;
const getDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detention = yield detention_model_1.default.findByPk(req.params.id);
        if (!detention)
            return res.status(404).json({ message: "Non trouvée" });
        return res.json(detention);
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur de récupération" });
    }
});
exports.getDetention = getDetention;
const updateDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detention = yield detention_model_1.default.findByPk(req.params.id);
        if (!detention)
            return res.status(404).json({ message: "Non trouvée" });
        yield detention.update(req.body);
        return res.json(detention);
    }
    catch (error) {
        return res.status(500).json({ error: "Échec de la mise à jour" });
    }
});
exports.updateDetention = updateDetention;
const deleteDetention = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detention = yield detention_model_1.default.findByPk(req.params.id);
        if (!detention)
            return res.status(404).json({ message: "Non trouvée" });
        yield detention.destroy();
        return res.json({ message: "Supprimée avec succès" });
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur de suppression" });
    }
});
exports.deleteDetention = deleteDetention;
const getAllDetentions = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detentions = yield detention_model_1.default.findAll();
        return res.json(detentions);
    }
    catch (error) {
        return res.status(500).json({ error: "Erreur de récupération des détentions" });
    }
});
exports.getAllDetentions = getAllDetentions;
