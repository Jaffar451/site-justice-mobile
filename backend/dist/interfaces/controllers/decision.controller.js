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
exports.deleteDecision = exports.signDecision = exports.updateDecision = exports.getDecision = exports.createDecision = exports.listDecisionsByCase = exports.listDecisions = void 0;
const decision_model_1 = __importDefault(require("../../models/decision.model"));
const case_model_1 = __importDefault(require("../../models/case.model"));
// 🔹 Liste toutes les décisions
const listDecisions = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield decision_model_1.default.findAll({
        include: [{ model: case_model_1.default, attributes: ["id", "status"] }],
    });
    return res.json(items);
});
exports.listDecisions = listDecisions;
// 🔹 Liste des décisions par affaire
const listDecisionsByCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseId = req.params.caseId;
        const items = yield decision_model_1.default.findAll({
            where: { caseId },
            include: [{ model: case_model_1.default, attributes: ["id", "status"] }],
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Erreur listDecisionsByCase:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.listDecisionsByCase = listDecisionsByCase;
// 🔹 Création décision (Juge uniquement)
const createDecision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        const { caseId, verdict, type, legalBasis, sentenceYears, sentenceMonths, fineAmount, decisionNumber, } = req.body;
        if (!caseId || !verdict) {
            return res.status(400).json({ message: "caseId et verdict sont requis" });
        }
        const caseItem = yield case_model_1.default.findByPk(caseId);
        if (!caseItem) {
            return res.status(404).json({ message: "Affaire introuvable" });
        }
        const num = decisionNumber ||
            `DEC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const item = yield decision_model_1.default.create({
            caseId,
            judgeId: user.id,
            verdict,
            type,
            legalBasis,
            sentenceYears,
            sentenceMonths,
            fineAmount,
            decisionNumber: num,
            date: new Date(),
            signedBy: null,
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Erreur createDecision:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.createDecision = createDecision;
// 🔹 Consultation décision
const getDecision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield decision_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Décision introuvable" });
    return res.json(item);
});
exports.getDecision = getDecision;
// 🔹 Modification décision (non signée)
const updateDecision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield decision_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Décision introuvable" });
    if (item.signedBy) {
        return res.status(403).json({ message: "Déjà signée" });
    }
    yield item.update(req.body);
    return res.json(item);
});
exports.updateDecision = updateDecision;
// 🔹 Signature de la décision (Juge)
const signDecision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        const item = yield decision_model_1.default.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Décision introuvable" });
        if (item.signedBy) {
            return res.status(400).json({ message: "Déjà signée" });
        }
        // 🔹 signature avec nom du juge
        yield item.update({ signedBy: `${user.firstname} ${user.lastname}` });
        // 🔥 Mise à jour FORCÉE de l’affaire
        yield case_model_1.default.update({
            status: "closed",
            stage: "archived",
            closedAt: new Date()
        }, { where: { id: item.caseId } });
        return res.json({
            message: "Décision signée + affaire clôturée et archivée",
            item
        });
    }
    catch (error) {
        console.error("Erreur signDecision:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.signDecision = signDecision;
// 🔹 Suppression décision (Admin)
const deleteDecision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield decision_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Décision introuvable" });
    yield item.destroy();
    return res.status(204).send();
});
exports.deleteDecision = deleteDecision;
