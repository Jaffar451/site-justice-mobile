"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize"); // ✅ Nécessaire pour les filtres de date
const models_1 = require("../../models");
const database_1 = require("../../config/database");
const export_service_1 = require("./export.service");
const notification_service_1 = require("./notification.service");
const exportService = new export_service_1.ExportService();
const notificationService = new notification_service_1.NotificationService();
class SchedulerService {
    static init() {
        // 1. Rapport de surpopulation (Tous les lundis à 8h00)
        node_cron_1.default.schedule('0 8 * * 1', async () => {
            console.log('🚀 [CRON] Génération du rapport de surpopulation...');
            await this.sendWeeklyPrisonReport();
        });
        // ✅ 2. Nettoyage des logs d'audit (Le 1er de chaque mois à minuit)
        node_cron_1.default.schedule('0 0 1 * *', async () => {
            console.log('🧹 [CRON] Nettoyage des anciens journaux d\'audit...');
            await this.cleanupAuditLogs();
        });
    }
    /**
     * 🧹 Supprime les logs plus vieux de 90 jours pour optimiser la DB
     */
    static async cleanupAuditLogs() {
        try {
            const retentionDays = 90;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const deletedCount = await models_1.AuditLog.destroy({
                where: {
                    createdAt: {
                        [sequelize_1.Op.lt]: cutoffDate // Supprime tout ce qui est "inférieur" à (avant) la date butoir
                    }
                }
            });
            console.log(`✅ [CRON] Nettoyage terminé : ${deletedCount} logs anciens supprimés.`);
        }
        catch (error) {
            console.error('❌ [CRON] Erreur lors du nettoyage des logs:', error.message);
        }
    }
    static async sendWeeklyPrisonReport() {
        try {
            const prisonData = await models_1.Prison.findAll({
                attributes: [
                    'id', 'name', 'city', 'capacity',
                    [
                        database_1.sequelize.literal(`(
              SELECT COUNT(*) FROM incarcerations AS i 
              WHERE i.prison_id = "Prison".id AND i.status IN ('preventive', 'convicted')
            )`),
                        'currentInmatesCount'
                    ]
                ]
            });
            const report = prisonData.map((p) => {
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
                await notificationService.sendMailWithAttachment(email, "📊 RAPPORT HEBDO : Occupation des prisons", "Veuillez trouver ci-joint l'état de la population carcérale.", `Situation_Penitentiaire_${new Date().toISOString().split('T')[0]}.xlsx`, excelBuffer);
            }
            console.log('✅ [CRON] Rapports envoyés.');
        }
        catch (error) {
            console.error('❌ [CRON] Erreur:', error.message);
        }
    }
}
exports.SchedulerService = SchedulerService;
