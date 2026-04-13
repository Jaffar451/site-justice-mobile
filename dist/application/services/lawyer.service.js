"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerService = void 0;
const database_1 = require("../../config/database");
const sequelize_1 = require("sequelize");
class LawyerService {
    /**
     * Récupère le suivi physique des dossiers pour un avocat
     */
    async getAcheminementDossiers(lawyerId) {
        const query = `
      SELECT 
        c.id, c.rg_number, c.status, c.room_number, c.floor, 
        ct.name as court_name
      FROM "Cases" c
      INNER JOIN "CaseLawyers" cl ON c.id = cl.case_id
      INNER JOIN "Courts" ct ON c.court_id = ct.id
      WHERE cl.lawyer_id = :lawyerId
      ORDER BY c.created_at DESC;
    `;
        const results = await database_1.sequelize.query(query, {
            replacements: { lawyerId },
            type: sequelize_1.QueryTypes.SELECT
        });
        return results;
    }
    /**
     * ✅ RÉSOUT L'ERREUR : Enregistre les conclusions dans la table Attachments
     */
    async saveConclusions(data) {
        const query = `
      INSERT INTO "Attachments" (
        case_id, title, file_url, file_type, uploaded_by, created_at, updated_at
      ) VALUES (
        :caseId, :title, :fileUrl, 'PDF', :lawyerId, NOW(), NOW()
      ) RETURNING *;
    `;
        const fileUrl = `/uploads/documents/${data.filename}`;
        const [newAttachment] = await database_1.sequelize.query(query, {
            replacements: {
                caseId: data.caseId,
                title: data.title,
                fileUrl: fileUrl,
                lawyerId: data.lawyerId
            },
            type: sequelize_1.QueryTypes.INSERT
        });
        return newAttachment;
    }
}
exports.LawyerService = LawyerService;
