"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesByCaseService = exports.createNoteService = void 0;
const note_model_1 = __importDefault(require("../../models/note.model")); // ✅ L'import qui manquait
const audit_service_1 = require("./audit.service");
/**
 * Service de création de note avec chiffrement automatique (via le modèle)
 */
const createNoteService = async (req, data) => {
    // Le chiffrement et le hachage se font automatiquement dans Note.init (setters)
    const newNote = await note_model_1.default.create({
        caseId: data.caseId,
        content: data.content,
        visibility: data.visibility,
        userId: req.user.id // ✅ Utilisation de userId comme défini dans votre modèle
    });
    // 📝 Audit log pour la traçabilité
    await (0, audit_service_1.logActivity)(req, "CREATE_NOTE", "Note", newNote.id, "info");
    return newNote;
};
exports.createNoteService = createNoteService;
/**
 * Récupérer les notes d'un dossier
 */
const getNotesByCaseService = async (caseId) => {
    return await note_model_1.default.findAll({
        where: { caseId },
        include: ["author"], // Permet de récupérer les infos de l'utilisateur (via l'alias défini)
        order: [['createdAt', 'DESC']]
    });
};
exports.getNotesByCaseService = getNotesByCaseService;
