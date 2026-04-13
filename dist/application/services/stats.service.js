"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class StatsService {
    /**
     * 📊 DASHBOARD GLOBAL (Vision Ministérielle)
     * Centralise les indicateurs de performance de la chaîne pénale.
     */
    async getGlobalDashboard() {
        try {
            // 1. Répartition par Statut (Workflow)
            const statusStats = await database_1.sequelize.query(`
        SELECT status, COUNT(*) as count 
        FROM "Complaints" 
        GROUP BY status
      `, { type: sequelize_1.QueryTypes.SELECT });
            // 2. Équilibre des forces : Police vs Gendarmerie
            // Utilisation de la colonne "district" validée par le schéma DB
            const organizationStats = await database_1.sequelize.query(`
        SELECT ps."district" as organization_type, COUNT(c.id) as total 
        FROM "PoliceStations" ps
        LEFT JOIN "Complaints" c ON c."police_station_id" = ps.id
        GROUP BY ps."district"
      `, { type: sequelize_1.QueryTypes.SELECT });
            // 3. Cartographie par District (Volume d'activité locale)
            const regionalStats = await database_1.sequelize.query(`
        SELECT ps."district", COUNT(c.id) as total 
        FROM "PoliceStations" ps
        LEFT JOIN "Complaints" c ON c."police_station_id" = ps.id
        GROUP BY ps."district"
        ORDER BY total DESC
        LIMIT 15
      `, { type: sequelize_1.QueryTypes.SELECT });
            // 4. Efficacité Temporelle (Délai moyen de traitement)
            // Formule : Moyenne de (Date de mise à jour - Date de création)
            const timingStats = await database_1.sequelize.query(`
        SELECT 
          COALESCE(AVG(EXTRACT(DAY FROM ("updated_at" - "created_at"))), 0) as avg_days
        FROM "Complaints"
        WHERE status IN ('transmise_parquet', 'saisi_juge', 'jugée')
      `, { type: sequelize_1.QueryTypes.SELECT });
            // 5. Sommaire Carcéral (Population et Taux de détention préventive)
            const penitentiarySummary = await database_1.sequelize.query(`
        SELECT 
          COUNT(*) as total_inmates,
          SUM(CASE WHEN status = 'preventive' THEN 1 ELSE 0 END) as preventive_count,
          SUM(CASE WHEN status = 'convicted' THEN 1 ELSE 0 END) as convicted_count
        FROM "incarcerations"
        WHERE status IN ('preventive', 'convicted')
      `, { type: sequelize_1.QueryTypes.SELECT });
            return {
                statusStats: statusStats || [],
                organizationStats: organizationStats || [],
                regionalStats: regionalStats || [],
                timingStats: {
                    avg_days: timingStats[0]?.avg_days ? Math.round(Number(timingStats[0].avg_days)) : 0
                },
                penitentiary: penitentiarySummary[0] || { total_inmates: 0, preventive_count: 0, convicted_count: 0 }
            };
        }
        catch (error) {
            console.error("Erreur SQL dans StatsService:", error);
            // Retourne une structure par défaut cohérente pour éviter les crashs Frontend
            return {
                statusStats: [],
                organizationStats: [],
                regionalStats: [],
                timingStats: { avg_days: 0 },
                penitentiary: { total_inmates: 0, preventive_count: 0, convicted_count: 0 }
            };
        }
    }
    /**
     * ⚖️ PERFORMANCE DES TRIBUNAUX (Clearance Rate)
     * Mesure le ratio entre dossiers ouverts et dossiers jugés.
     */
    async getCourtPerformance() {
        return database_1.sequelize.query(`
      SELECT 
        co.name as court_name,
        COUNT(ca.id) as total_cases,
        SUM(CASE WHEN ca.status = 'jugé' THEN 1 ELSE 0 END) as resolved_cases,
        CASE 
          WHEN COUNT(ca.id) > 0 THEN ROUND((SUM(CASE WHEN ca.status = 'jugé' THEN 1 ELSE 0 END)::float / COUNT(ca.id)::float) * 100)
          ELSE 0 
        END as clearance_rate
      FROM "Courts" co
      LEFT JOIN "CaseModels" ca ON ca."court_id" = co.id
      GROUP BY co.id, co.name
      ORDER BY clearance_rate DESC
    `, { type: sequelize_1.QueryTypes.SELECT });
    }
}
exports.StatsService = StatsService;
