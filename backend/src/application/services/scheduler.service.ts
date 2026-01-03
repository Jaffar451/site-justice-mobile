import cron from 'node-cron';
import { Op } from 'sequelize'; // ✅ Nécessaire pour les filtres de date
import { Prison, AuditLog } from '../../models';
import { sequelize } from '../../config/database';
import { ExportService } from './export.service';
import { NotificationService } from './notification.service';

const exportService = new ExportService();
const notificationService = new NotificationService();

export class SchedulerService {
  
  public static init() {
    // 1. Rapport de surpopulation (Tous les lundis à 8h00)
    cron.schedule('0 8 * * 1', async () => {
      console.log('🚀 [CRON] Génération du rapport de surpopulation...');
      await this.sendWeeklyPrisonReport();
    });

    // ✅ 2. Nettoyage des logs d'audit (Le 1er de chaque mois à minuit)
    cron.schedule('0 0 1 * *', async () => {
      console.log('🧹 [CRON] Nettoyage des anciens journaux d\'audit...');
      await this.cleanupAuditLogs();
    });
  }

  /**
   * 🧹 Supprime les logs plus vieux de 90 jours pour optimiser la DB
   */
  private static async cleanupAuditLogs() {
    try {
      const retentionDays = 90; 
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await AuditLog.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate // Supprime tout ce qui est "inférieur" à (avant) la date butoir
          }
        }
      });

      console.log(`✅ [CRON] Nettoyage terminé : ${deletedCount} logs anciens supprimés.`);
    } catch (error: any) {
      console.error('❌ [CRON] Erreur lors du nettoyage des logs:', error.message);
    }
  }

  private static async sendWeeklyPrisonReport() {
    try {
      const prisonData = await Prison.findAll({
        attributes: [
          'id', 'name', 'city', 'capacity',
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM incarcerations AS i 
              WHERE i.prison_id = "Prison".id AND i.status IN ('preventive', 'convicted')
            )`),
            'currentInmatesCount'
          ]
        ]
      });

      const report = prisonData.map((p: any) => {
        const current = parseInt(p.getDataValue('currentInmatesCount')) || 0;
        const capacity = p.capacity || 1;
        const rate = Math.round((current / capacity) * 100);

        return {
          "ID": p.id,
          "Établissement": p.name,
          "Ville": p.city,
          "Capacité": capacity,
          "Détenus": current,
          "Taux": `${rate}%`,
          "Alerte": rate > 100 ? "OUI" : "NON"
        };
      });

      const excelBuffer = await exportService.generatePrisonExcel(report);
      const recipients = process.env.REPORT_RECIPIENTS?.split(',') || ["cabinet@justice.ne"];

      for (const email of recipients) {
        await notificationService.sendMailWithAttachment(
          email,
          "📊 RAPPORT HEBDO : Occupation des prisons",
          "Veuillez trouver ci-joint l'état de la population carcérale.",
          `Situation_Penitentiaire_${new Date().toISOString().split('T')[0]}.xlsx`,
          excelBuffer as any
        );
      }

      console.log('✅ [CRON] Rapports envoyés.');
    } catch (error: any) {
      console.error('❌ [CRON] Erreur:', error.message);
    }
  }
}