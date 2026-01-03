import {sequelize} from '../../config/database';
import { QueryTypes } from 'sequelize';

export class CitizenService {
  /**
   * Récupère les dossiers où l'utilisateur est le citoyen principal
   */
  async getMyCases(citizenId: number) {
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

    return await sequelize.query(query, {
      replacements: { citizenId },
      type: QueryTypes.SELECT
    });
  }

  /**
   * Récupère les notifications personnelles
   */
  async getMyNotifications(userId: number) {
    const query = `
      SELECT * FROM "Notifications" 
      WHERE user_id = :userId 
      ORDER BY created_at DESC 
      LIMIT 20;
    `;

    return await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });
  }
}