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
exports.deleteHearing = exports.updateHearing = exports.getHearing = exports.createHearing = exports.listHearingsByCase = exports.listHearings = void 0;
const hearing_model_1 = __importDefault(require("../../models/hearing.model"));
const case_model_1 = __importDefault(require("../../models/case.model"));
const listHearings = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield hearing_model_1.default.findAll();
    return res.json(items);
});
exports.listHearings = listHearings;
const listHearingsByCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const caseId = req.params.caseId;
    const items = yield hearing_model_1.default.findAll({
        where: { caseId },
        order: [["date", "ASC"]],
    });
    return res.json(items);
});
exports.listHearingsByCase = listHearingsByCase;
const createHearing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !["judge", "clerk"].includes(user.role)) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        const { caseId, date, type, courtroom, durationMinutes, notes } = req.body;
        if (!caseId || !date)
            return res.status(400).json({ message: "caseId + date requis" });
        const exists = yield case_model_1.default.findByPk(caseId);
        if (!exists) {
            return res.status(404).json({ message: "Affaire introuvable" });
        }
        const item = yield hearing_model_1.default.create({
            caseId,
            judgeId: user.role === "judge" ? user.id : null,
            date,
            type,
            courtroom,
            durationMinutes,
            notes,
            status: "scheduled",
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Erreur createHearing:", error.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.createHearing = createHearing;
const getHearing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield hearing_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Audience introuvable" });
    return res.json(item);
});
exports.getHearing = getHearing;
const updateHearing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !["judge", "clerk"].includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
    }
    const item = yield hearing_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Audience introuvable" });
    yield item.update(req.body);
    return res.json(item);
});
exports.updateHearing = updateHearing;
const deleteHearing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
    }
    const item = yield hearing_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Audience introuvable" });
    yield item.destroy();
    return res.status(204).send();
});
exports.deleteHearing = deleteHearing;
