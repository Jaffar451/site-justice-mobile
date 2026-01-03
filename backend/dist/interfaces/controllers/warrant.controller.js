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
exports.deleteWarrant = exports.updateWarrant = exports.getWarrant = exports.createWarrant = void 0;
const warrant_model_1 = __importDefault(require("../../models/warrant.model"));
const createWarrant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warrant = yield warrant_model_1.default.create(req.body);
        return res.status(201).json(warrant);
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur lors de la création", error });
    }
});
exports.createWarrant = createWarrant;
const getWarrant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warrant = yield warrant_model_1.default.findByPk(req.params.id);
        if (!warrant)
            return res.status(404).json({ message: "Non trouvé" });
        return res.json(warrant);
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur de récupération", error });
    }
});
exports.getWarrant = getWarrant;
const updateWarrant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [updated] = yield warrant_model_1.default.update(req.body, { where: { id: req.params.id } });
        if (!updated)
            return res.status(404).json({ message: "Non trouvé" });
        const updatedRecord = yield warrant_model_1.default.findByPk(req.params.id);
        return res.json(updatedRecord);
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur de mise à jour", error });
    }
});
exports.updateWarrant = updateWarrant;
const deleteWarrant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield warrant_model_1.default.destroy({ where: { id: req.params.id } });
        if (!deleted)
            return res.status(404).json({ message: "Non trouvé" });
        return res.json({ message: "Supprimé avec succès" });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur de suppression", error });
    }
});
exports.deleteWarrant = deleteWarrant;
