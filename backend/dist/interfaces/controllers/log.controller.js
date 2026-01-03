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
exports.getLog = exports.listLogs = void 0;
const log_model_1 = __importDefault(require("../../models/log.model"));
const listLogs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const logs = yield log_model_1.default.findAll({
        order: [["timestamp", "DESC"]],
    });
    return res.json(logs);
});
exports.listLogs = listLogs;
const getLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield log_model_1.default.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ message: "Log introuvable" });
    return res.json(item);
});
exports.getLog = getLog;
// ⚠️ Pas de création/modification supp → middleware uniquement
