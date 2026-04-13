"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenService = void 0;
const database_1 = require("../../config/database");
const sequelize_1 = require("sequelize");
class CitizenService {
    /**
     * Récupère les dossiers où l'utilisateur est le citoyen principal
     */
    async getMyCases(citizenId) {
        const query = `
      SELECT 
        c.id, c.rg_number, c.status, c.created_at,
        ct.name as court_name,
        -- Vérifier si l'huissier a déjà signifié un acte
        EXISTS(
          SELECT 1 FROM "Summons" s 
          WHERE s.case_id = c.id AND s.status = 'SERVED'
        ) as is_served
      FROM "Cases" c
      JOIN "Courts" ct ON c.court_id = ct.id
      WHERE c.citizen_id = :citizenId
      ORDER BY c.created_at DESC;
    `;
        return await database_1.sequelize.query(query, {
            replacements: { citizenId },
            type: sequelize_1.QueryTypes.SELECT
        });
    }
    /**
     * Récupère les notifications personnelles
     */
    async getMyNotifications(userId) {
        const query = `
      SELECT * FROM "Notifications" 
      WHERE user_id = :userId 
      ORDER BY created_at DESC 
      LIMIT 20;
    `;
        return await database_1.sequelize.query(query, {
            replacements: { userId },
            type: sequelize_1.QueryTypes.SELECT
        });
    }
}
exports.CitizenService = CitizenService;
