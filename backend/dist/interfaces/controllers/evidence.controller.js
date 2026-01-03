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
exports.deleteEvidence = exports.updateEvidence = exports.getEvidence = exports.createEvidence = exports.listMyEvidence = exports.listEvidence = void 0;
const evidence_model_1 = __importDefault(require("../../models/evidence.model"));
const listEvidence = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield evidence_model_1.default.findAll();
    return res.json(items);
});
exports.listEvidence = listEvidence;
// 📌 Citoyen → voir ses propres preuves
const listMyEvidence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: "Non autorisé" });
    const items = yield evidence_model_1.default.findAll({
        where: { uploaderId: user.id },
    });
    return res.json(items);
});
exports.listMyEvidence = listMyEvidence;
const createEvidence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const r = req;
        const { caseId, type, description, chainOfCustodyStatus } = req.body;
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        if (!caseId)
            return res.status(400).json({ message: "CaseId requis" });
        if (!type)
            return res.status(400).json({ message: "Type requis" });
        if (!r.file)
            return res.status(400).json({ message: "Fichier requis" });
        const item = yield evidence_model_1.default.create({
            caseId,
            uploaderId: user.id,
            filename: r.file.originalname,
            fileUrl: `/uploads/evidence/${r.file.filename}`,
            type,
            description,
            chainOfCustodyStatus,
            hash: r.file.filename, // Hash temporaire (futur SHA-256)
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Erreur création preuve:", error.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.createEvidence = createEvidence;
const getEvidence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield evidence_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Preuve introuvable" });
    return res.json(item);
});
exports.getEvidence = getEvidence;
const updateEvidence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield evidence_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Preuve introuvable" });
    yield item.update(req.body);
    return res.json(item);
});
exports.updateEvidence = updateEvidence;
const deleteEvidence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield evidence_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Preuve introuvable" });
    yield item.destroy();
    return res.status(204).send();
});
exports.deleteEvidence = deleteEvidence;
