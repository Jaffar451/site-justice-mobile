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
exports.getArrestWarrants = exports.createArrestWarrant = void 0;
const arrestWarrant_model_1 = __importDefault(require("../../models/arrestWarrant.model"));
const createArrestWarrant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { caseId, personName, reason } = req.body;
        const issuingJudgeId = req.user.id;
        if (!caseId || !personName || !reason) {
            return res.status(400).json({ message: "caseId, personName, and reason are required." });
        }
        const warrant = yield arrestWarrant_model_1.default.create({
            caseId,
            personName,
            reason,
            issuingJudgeId,
            issuedAt: new Date()
        });
        return res.status(201).json(warrant);
    }
    catch (error) {
        // Log the error for debugging
        console.error("Error creating arrest warrant:", error);
        return res.status(500).json({ message: "Erreur serveur lors de la création du mandat d'arrêt." });
    }
});
exports.createArrestWarrant = createArrestWarrant;
const getArrestWarrants = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warrants = yield arrestWarrant_model_1.default.findAll();
        return res.json(warrants);
    }
    catch (error) {
        console.error("Error fetching arrest warrants:", error);
        return res.status(500).json({ message: "Erreur serveur lors de la récupération des mandats d'arrêt." });
    }
});
exports.getArrestWarrants = getArrestWarrants;
