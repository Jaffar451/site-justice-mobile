import sequelize from '../../config/database';
import { QueryTypes } from 'sequelize';

export class BailiffService {
  /**
   * Récupère les missions (Summons) assignées à l'huissier qui sont encore 'PENDING'
   */
  async getPendingMissions(bailiffId: number) {
    const query = `
      SELECT 
        s.id, 
        s.rg_number, 
        s.document_url, 
        s.status,
        c.name as court_name
      FROM "Summons" s
      JOIN "Courts" c ON s.court_id = c.id
      WHERE s.bailiff_id = :bailiffId 
      AND s.status = 'PENDING'
      ORDER BY s.created_at ASC;
    `;

    return await sequelize.query(query, {
      replacements: { bailiffId },
      type: QueryTypes.SELECT
    });
  }

  /**
   * ✅ MISE À JOUR : Valide l'acte ET notifie le citoyen automatiquement
   */
  async markAsSignified(data: { missionId: number; bailiffId: number; lat: number; lng: number }) {
    // Utilisation d'une transaction pour la sécurité des données
    const t = await sequelize.transaction();

    try {
      // 1. Mise à jour du statut de la convocation (Summons)
      await sequelize.query(`
        UPDATE "Summons"
        SET 
          status = 'SERVED',
          served_at = NOW(),
          latitude = :lat,
          longitude = :lng,
          updated_at = NOW()
        WHERE id = :missionId 
        AND bailiff_id = :bailiffId;
      `, { 
        replacements: data, 
        type: QueryTypes.UPDATE,
        transaction: t 
      });

      // 2. Recherche du CitizenID lié au dossier (Case) pour la notification
      // On récupère aussi le RG_NUMBER pour personnaliser le message
      const caseInfo: any = await sequelize.query(`
        SELECT c.citizen_id, c.rg_number 
        FROM "Cases" c
        JOIN "Summons" s ON s.case_id = c.id
        WHERE s.id = :missionId
        LIMIT 1;
      `, { 
        replacements: { missionId: data.missionId }, 
        type: QueryTypes.SELECT,
        transaction: t 
      });

      if (caseInfo && caseInfo.length > 0) {
        const { citizen_id, rg_number } = caseInfo[0];

        // 3. Création de la notification dans la base pour le Citoyen
        await sequelize.query(`
          INSERT INTO "Notifications" (user_id, title, message, type, created_at, updated_at)
          VALUES (
            :citizenId, 
            'Acte Judiciaire Signifié', 
            :message, 
            'CASE_UPDATE', 
            NOW(), 
            NOW()
          );
        `, { 
          replacements: { 
            citizenId: citizen_id, 
            message: `L'huissier a officiellement déposé un acte concernant votre dossier ${rg_number}.` 
          }, 
          type: QueryTypes.INSERT,
          transaction: t 
        });
      }

      // Valider toutes les opérations
      await t.commit();
      return { success: true };

    } catch (error) {
      // En cas d'erreur, on annule tout (Rollback)
      await t.rollback();
      console.error("Erreur transaction signification:", error);
      throw error;
    }
  }
}