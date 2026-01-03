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
exports.deleteInterrogation = exports.updateInterrogation = exports.getInterrogation = exports.getAllInterrogations = exports.createInterrogation = void 0;
const interrogation_model_1 = __importDefault(require("../../models/interrogation.model"));
const createInterrogation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interrogation = yield interrogation_model_1.default.create(req.body);
        return res.status(201).json(interrogation);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur création", error: err });
    }
});
exports.createInterrogation = createInterrogation;
const getAllInterrogations = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interrogations = yield interrogation_model_1.default.findAll();
        return res.json(interrogations);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur récupération", error: err });
    }
});
exports.getAllInterrogations = getAllInterrogations;
const getInterrogation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interrogation = yield interrogation_model_1.default.findByPk(req.params.id);
        if (!interrogation)
            return res.status(404).json({ message: "Non trouvée" });
        return res.json(interrogation);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur", error: err });
    }
});
exports.getInterrogation = getInterrogation;
const updateInterrogation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interrogation = yield interrogation_model_1.default.findByPk(req.params.id);
        if (!interrogation)
            return res.status(404).json({ message: "Non trouvée" });
        yield interrogation.update(req.body);
        return res.json(interrogation);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur MAJ", error: err });
    }
});
exports.updateInterrogation = updateInterrogation;
const deleteInterrogation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interrogation = yield interrogation_model_1.default.findByPk(req.params.id);
        if (!interrogation)
            return res.status(404).json({ message: "Non trouvée" });
        yield interrogation.destroy();
        return res.json({ message: "Supprimée" });
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur suppression", error: err });
    }
});
exports.deleteInterrogation = deleteInterrogation;
