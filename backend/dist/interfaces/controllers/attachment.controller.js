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
exports.deleteAttachment = exports.listAttachments = exports.uploadAttachment = void 0;
const attachment_model_1 = __importDefault(require("../../models/attachment.model"));
const case_model_1 = __importDefault(require("../../models/case.model"));
const uploadAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { caseId, fileUrl, filename } = req.body;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        if (!caseId || !fileUrl || !filename) {
            return res.status(400).json({ message: "Champs requis manquants" });
        }
        const caseItem = yield case_model_1.default.findByPk(caseId);
        if (!caseItem) {
            console.error("📌 Affaire introuvable pour caseId:", caseId);
            return res.status(404).json({ message: "Affaire introuvable" });
        }
        const item = yield attachment_model_1.default.create({
            caseId,
            fileUrl,
            filename,
            uploadedBy: user.id,
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("🚨 ERREUR uploadAttachment:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.uploadAttachment = uploadAttachment;
const listAttachments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { caseId } = req.params;
        const items = yield attachment_model_1.default.findAll({ where: { caseId } });
        return res.json(items);
    }
    catch (error) {
        console.error("🚨 ERREUR listAttachments:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.listAttachments = listAttachments;
const deleteAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield attachment_model_1.default.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Introuvable" });
        yield item.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error("🚨 ERREUR deleteAttachment:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.deleteAttachment = deleteAttachment;
