"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceService = void 0;
const evidence_model_1 = __importDefault(require("../../models/evidence.model"));
class EvidenceService {
    /**
     * 📂 Récupérer toutes les preuves liées à un dossier
     */
    async getEvidenceByCase(caseId) {
        // Si caseId est 0, on peut retourner tout (utile pour l'admin)
        const filter = caseId === 0 ? {} : { caseId };
        return await evidence_model_1.default.findAll({
            where: filter,
            order: [['createdAt', 'DESC']]
        });
    }
    /**
     * 🔍 AJOUTÉ : Récupérer une seule preuve par son ID
     * (Corrige l'erreur TypeScript dans le contrôleur)
     */
    async getEvidenceById(id) {
        return await evidence_model_1.default.findByPk(id);
    }
    /**
     * 💾 Ajouter une nouvelle preuve
     */
    async addEvidence(data) {
        return await evidence_model_1.default.create({
            caseId: data.caseId,
            uploaderId: data.uploaderId,
            description: data.description,
            type: data.type,
            fileUrl: data.fileUrl,
            filename: data.filename,
            hash: data.hash
        });
    }
    /**
     * 📝 AJOUTÉ : Mettre à jour les informations d'une preuve
     * (Corrige l'erreur TypeScript et le crash au démarrage)
     */
    async updateEvidence(id, data) {
        const evidence = await evidence_model_1.default.findByPk(id);
        if (!evidence)
            return null;
        return await evidence.update(data);
    }
    /**
     * 🗑️ Supprimer une preuve
     */
    async deleteEvidence(id) {
        const evidence = await evidence_model_1.default.findByPk(id);
        if (!evidence)
            return null;
        await evidence.destroy();
        return true;
    }
}
exports.EvidenceService = EvidenceService;
