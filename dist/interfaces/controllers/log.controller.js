"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLog = exports.listLogs = void 0;
// Assurez-vous d'importer le bon modèle selon votre structure (auditLog.model.ts)
const auditLog_model_1 = __importDefault(require("../../models/auditLog.model"));
const listLogs = async (req, res) => {
    try {
        const logs = await auditLog_model_1.default.findAll({
            order: [["timestamp", "DESC"]],
        });
        return res.json(logs);
    }
    catch (error) {
        console.error("Error in listLogs:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.listLogs = listLogs;
const getLog = async (req, res) => {
    try {
        // Correction : forcer le typage en 'string' pour satisfaire Sequelize
        const logId = req.params.id;
        const item = await auditLog_model_1.default.findByPk(logId);
        if (!item) {
            return res.status(404).json({ message: "Log introuvable" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error in getLog:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getLog = getLog;
