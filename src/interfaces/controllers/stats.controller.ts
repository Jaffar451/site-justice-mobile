import { Response } from "express";
import { CustomRequest } from "../../types/express-request";
import { Complaint, Prison, Incarceration, CaseModel, Court, AuditLog } from "../../models";
import { StatsService } from "../../application/services/stats.service";
import { ExportService } from "../../application/services/export.service";
import { sequelize } from "../../config/database";
import { Op } from "sequelize";

const statsService = new StatsService();
const exportService = new ExportService();

/**
 * 🔐 HELPER: Audit des accès statistiques
 */
const auditStatsAction = async (req: CustomRequest, action: string, details: string) => {
  try {
    await AuditLog.create({
      userId: req.user?.id || null,
      action: `STATS_${action}`,
      severity: "INFO",
      method: "GET",
      endpoint: req.originalUrl,
      ip: req.ip || "0.0.0.0",
      status: "SUCCESS",
      details: `Admin: ${req.user?.firstname} ${req.user?.lastname} | ${details}`
    } as any);
  } catch (e) {
    console.error("Audit stats failed:", e);
  }
};

/**
 * ✅ 1. DASHBOARD GLOBAL
 * Note : J'ai ajouté des try/catch individuels et des valeurs par défaut
 */
export const getDashboardStats = async (req: CustomRequest, res: Response) => {
  try {
    // 1. Récupération des stats de base (Plaintes/Users)
    const baseStats = await statsService.getGlobalDashboard();

    // 2. Calcul population carcérale
    // Utilisation de count avec gestion d'erreur
    const totalInmates = await Incarceration.count({ 
      where: { status: { [Op.in]: ["preventive", "convicted"] } } 
    }).catch(() => 0);
    
    const preventiveCount = await Incarceration.count({ 
      where: { status: "preventive" } 
    }).catch(() => 0);

    const prisonsCount = await Prison.count().catch(() => 0);
    
    const preventiveRate = totalInmates > 0 ? Math.round((preventiveCount / totalInmates) * 100) : 0;

    await auditStatsAction(req, "VIEW_DASHBOARD", "Consultation globale");

    // ✅ IMPORTANT: On assure que timingStats existe pour éviter le crash Front
    return res.json({
      statusStats: baseStats.statusStats || [],
      regionalStats: baseStats.regionalStats || [],
      timingStats: baseStats.timingStats || { avg_days: 0 },
      penitentiary: {
        totalInmates,
        preventiveCount,
        convictedCount: totalInmates - preventiveCount,
        prisonsCount,
        preventiveRate: `${preventiveRate}%`,
        status: preventiveRate > 70 ? "CRITIQUE" : "STABLE"
      },
      generatedAt: new Date()
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération du dashboard", error: error.message });
  }
};

/**
 * ✅ 2. ANALYSE DES INFRACTIONS
 */
export const getInfractions = async (req: CustomRequest, res: Response) => {
  try {
    const stats = await Complaint.findAll({
      attributes: [
        // Correction : Utilisation du nom de colonne correct (provisionalOffence souvent mappé en provisional_offence)
        [sequelize.fn('COALESCE', sequelize.col('provisional_offence'), 'Non spécifié'), 'offence'], 
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['provisional_offence'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    });
    return res.json(stats);
  } catch (error: any) {
    console.error("Infractions Error:", error);
    return res.status(500).json({ message: "Erreur calcul infractions" });
  }
};

/**
 * ✅ 3. RAPPORT D'OCCUPATION DES PRISONS
 */
export const getPrisonOccupancy = async (req: CustomRequest, res: Response) => {
  try {
    const prisonData = await Prison.findAll({
      attributes: [
        'id', 'name', 'city', 'capacity',
        [
          // Attention : Vérifiez si la table s'appelle "Incarcerations" ou "incarcerations"
          sequelize.literal(`(
            SELECT COUNT(*) FROM "Incarcerations" AS i 
            WHERE i."prisonId" = "Prison".id AND i.status IN ('preventive', 'convicted')
          )`),
          'currentInmatesCount'
        ]
      ],
      order: [[sequelize.literal('"currentInmatesCount"'), 'DESC']]
    });

    const report = prisonData.map((p: any) => {
      const current = parseInt(p.getDataValue('currentInmatesCount')) || 0;
      const capacity = p.capacity || 1;
      const occupancyRate = Math.round((current / capacity) * 100);

      return {
        id: p.id,
        name: p.name,
        location: p.city,
        capacity: p.capacity,
        currentInmates: current,
        occupancyRate: `${occupancyRate}%`,
        alertLevel: occupancyRate > 100 ? "ROUGE" : occupancyRate > 80 ? "ORANGE" : "VERT"
      };
    });

    return res.json(report);
  } catch (error: any) {
    console.error("Prison Occupancy Error:", error);
    return res.status(500).json({ message: "Erreur calcul occupation" });
  }
};

/**
 * ✅ 4. TAUX D'ÉVACUATION JUDICIAIRE (Performance)
 */
export const getCourtEfficiency = async (req: CustomRequest, res: Response) => {
  try {
    const stats = await Court.findAll({
      attributes: [
        'name',
        [sequelize.literal(`(SELECT COUNT(*) FROM "CaseModels" WHERE "courtId" = "Court".id)`), 'totalCases'],
        [sequelize.literal(`(SELECT COUNT(*) FROM "CaseModels" WHERE "courtId" = "Court".id AND status = 'jugé')`), 'closedCases']
      ]
    });

    const efficiencyReport = stats.map((c: any) => {
      const total = parseInt(c.getDataValue('totalCases')) || 0;
      const closed = parseInt(c.getDataValue('closedCases')) || 0;
      return {
        court: c.name,
        total,
        closed,
        clearanceRate: total > 0 ? `${Math.round((closed / total) * 100)}%` : "0%"
      };
    });

    return res.json(efficiencyReport);
  } catch (error: any) {
    console.error("Court Efficiency Error:", error);
    return res.status(500).json({ message: "Erreur performance judiciaire" });
  }
};