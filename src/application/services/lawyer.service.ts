import {sequelize} from '../../config/database'; 
import { QueryTypes } from 'sequelize';

export class LawyerService {
  /**
   * Récupère le suivi physique des dossiers pour un avocat
   */
  async getAcheminementDossiers(lawyerId: number) {
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

    const results = await sequelize.query(query, {
      replacements: { lawyerId },
      type: QueryTypes.SELECT
    });

    return results; 
  }

  /**
   * ✅ RÉSOUT L'ERREUR : Enregistre les conclusions dans la table Attachments
   */
  async saveConclusions(data: {
    lawyerId: number;
    caseId: number;
    title: string;
    filename: string;
    originalName: string;
    path: string;
  }) {
    const query = `
      INSERT INTO "Attachments" (
        case_id, title, file_url, file_type, uploaded_by, created_at, updated_at
      ) VALUES (
        :caseId, :title, :fileUrl, 'PDF', :lawyerId, NOW(), NOW()
      ) RETURNING *;
    `;

    const fileUrl = `/uploads/documents/${data.filename}`;

    const [newAttachment] = await sequelize.query(query, {
      replacements: {
        caseId: data.caseId,
        title: data.title,
        fileUrl: fileUrl,
        lawyerId: data.lawyerId
      },
      type: QueryTypes.INSERT
    });

    return newAttachment;
  }
}