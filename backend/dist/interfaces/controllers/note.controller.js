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
exports.getNote = exports.deleteNote = exports.updateNote = exports.createNote = exports.listNotes = void 0;
const note_model_1 = __importDefault(require("../../models/note.model"));
const assignment_model_1 = __importDefault(require("../../models/assignment.model"));
const complaint_model_1 = __importDefault(require("../../models/complaint.model"));
const case_model_1 = __importDefault(require("../../models/case.model"));
const ROLES_ALLOWED = ["police", "prosecutor", "judge", "clerk", "admin"];
const ensureAuthorized = (user) => {
    if (!user || !ROLES_ALLOWED.includes(user.role)) {
        throw new Error("ACCESS_DENIED");
    }
};
const ensureCaseAccess = (user, caseId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user)
        throw new Error("ACCESS_DENIED");
    if (user.role === "admin")
        return true;
    if (user.role === "citizen")
        throw new Error("ACCESS_DENIED");
    const caseItem = yield case_model_1.default.findByPk(caseId, { include: [complaint_model_1.default] });
    if (!caseItem)
        throw new Error("NOT_FOUND");
    const a = yield assignment_model_1.default.findOne({
        where: { caseId, userId: user.id },
    });
    if (!a)
        throw new Error("ACCESS_DENIED");
    return true;
});
const listNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        ensureAuthorized(user);
        const caseId = Number(req.query.caseId);
        if (!caseId) {
            return res.status(400).json({ message: "caseId requis" });
        }
        yield ensureCaseAccess(user, caseId);
        const items = yield note_model_1.default.findAll({
            where: { caseId },
            order: [["createdAt", "DESC"]],
        });
        return res.json(items);
    }
    catch (e) {
        return res.status(e.message === "ACCESS_DENIED" ? 403 : 404).json({ message: "Accès interdit" });
    }
});
exports.listNotes = listNotes;
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        ensureAuthorized(user);
        const { caseId, content, visibility = "case_global" } = req.body;
        if (!caseId || !content) {
            return res.status(400).json({ message: "Données manquantes" });
        }
        yield ensureCaseAccess(user, caseId);
        const item = yield note_model_1.default.create({
            caseId,
            userId: user.id,
            content,
            visibility,
        });
        return res.status(201).json(item);
    }
    catch (e) {
        return res.status(e.message === "ACCESS_DENIED" ? 403 : 404).json({ message: "Accès interdit" });
    }
});
exports.createNote = createNote;
const updateNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        ensureAuthorized(user);
        const item = yield note_model_1.default.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Note introuvable" });
        }
        yield ensureCaseAccess(user, item.caseId);
        if (item.userId !== user.id && user.role !== "admin") {
            return res.status(403).json({ message: "Non modifiable" });
        }
        yield item.update(req.body);
        return res.json(item);
    }
    catch (_a) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.updateNote = updateNote;
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Réservé admin" });
    }
    const item = yield note_model_1.default.findByPk(req.params.id);
    if (!item) {
        return res.status(404).json({ message: "Note introuvable" });
    }
    yield item.destroy();
    return res.status(204).send();
});
exports.deleteNote = deleteNote;
const getNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield note_model_1.default.findByPk(req.params.id);
    if (!item) {
        return res.status(404).json({ message: "Note introuvable" });
    }
    return res.json(item);
});
exports.getNote = getNote;
