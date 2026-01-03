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
exports.updateSummonStatus = exports.getSummonsByComplaint = exports.listSummons = exports.createSummon = void 0;
const zod_1 = require("zod");
const summon_model_1 = __importDefault(require("../../models/summon.model"));
const complaint_model_1 = __importDefault(require("../../models/complaint.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const createSchema = zod_1.z.object({
    complaintId: zod_1.z.number(),
    targetName: zod_1.z.string(),
    targetPhone: zod_1.z.string().optional(),
    scheduledAt: zod_1.z.string().datetime(),
    location: zod_1.z.string(),
    reason: zod_1.z.string().optional(),
});
const createSummon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = createSchema.parse(req.body);
        const officerId = req.user.id;
        const complaint = yield complaint_model_1.default.findByPk(data.complaintId);
        if (!complaint)
            return res.status(404).json({ message: "Plainte introuvable" });
        const summon = yield summon_model_1.default.create(Object.assign(Object.assign({}, data), { scheduledAt: new Date(data.scheduledAt), issuedBy: officerId }));
        return res.status(201).json(summon);
    }
    catch (err) {
        console.error("Erreur createSummon:", err);
        return res.status(400).json({ message: "Requête invalide", error: err });
    }
});
exports.createSummon = createSummon;
const listSummons = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summons = yield summon_model_1.default.findAll({
            include: [
                { model: complaint_model_1.default, as: "complaint" },
                {
                    model: user_model_1.default,
                    as: "officer",
                    attributes: ["id", "firstname", "lastname", "role"],
                },
            ],
            order: [["scheduledAt", "DESC"]],
        });
        return res.json(summons);
    }
    catch (err) {
        console.error("Erreur listSummons:", err);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.listSummons = listSummons;
const getSummonsByComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complaintIdStr = req.params.complaintId;
        if (!complaintIdStr) {
            return res.status(400).json({ message: "ID de la plainte manquant." });
        }
        const complaintId = parseInt(complaintIdStr, 10);
        if (isNaN(complaintId))
            return res.status(400).json({ message: "ID de la plainte invalide." });
        const summons = yield summon_model_1.default.findAll({ where: { complaintId } });
        return res.json(summons);
    }
    catch (_a) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.getSummonsByComplaint = getSummonsByComplaint;
const updateSummonStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summon = yield summon_model_1.default.findByPk(req.params.id);
        if (!summon)
            return res.status(404).json({ message: "Non trouvée" });
        const { status } = req.body;
        if (!["envoyée", "reçue", "non_remise", "ignorée", "effectuée", "reportée"].includes(status))
            return res.status(400).json({ message: "Statut invalide" });
        summon.status = status;
        yield summon.save();
        return res.json(summon);
    }
    catch (_a) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.updateSummonStatus = updateSummonStatus;
