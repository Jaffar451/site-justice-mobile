// @ts-nocheck
// PATH: src/interfaces/controllers/dashboard.controller.ts
import { Request, Response } from "express";
import { Prison, Incarceration, PoliceStation, Complaint } from "../../models"; 
import { sequelize } from "../../config/database"; 

/**
 * 📊 1. STATISTIQUES CARCÉRALES
 * Calcule la population carcérale et identifie les zones de surpopulation.
 */
export const getPrisonStats = async (_req: Request, res: Response) => {
  try {
    const stats = await Prison.findAll({
      attributes: [
        'id', 'name', 'location', 'capacity',
        [sequelize.fn('COUNT', sequelize.col('prisonInmates.id')), 'currentDetaineesCount']
      ],
      include: [{
        model: Incarceration,
        as: 'prisonInmates',
        attributes: [],
        required: false 
      }],
      group: ['Prison.id', 'Prison.name', 'Prison.location', 'Prison.capacity'],
      order: [[sequelize.literal('"currentDetaineesCount"'), 'DESC']]
    });

    const detailedStats = stats.map((s: any) => {
      const data = s.get({ plain: true });
      const count = parseInt(data.currentDetaineesCount || '0', 10);
      const capacity = data.capacity || 0;

      return {
        ...data,
        currentDetaineesCount: count,
        occupancyRate: capacity > 0 ? parseFloat(((count / capacity) * 100).toFixed(2)) : 0,
        status: count > capacity ? 'OVERLOADED' : 'NORMAL'
      };
    });

    return res.json({ success: true, data: detailedStats });
  } catch (error: any) {
    console.error("❌ Erreur Dashboard Prison :", error.message);
    return res.status(500).json({ success: false, message: "Erreur statistiques carcérales." });
  }
};

/**
 * 👮 2. STATISTIQUES POLICE & GENDARMERIE
 * Volume de plaintes enregistrées par établissement.
 */
export const getPoliceStats = async (_req: Request, res: Response) => {
  try {
    // 1. Agrégation des plaintes par Commissariat/Brigade
    const stats = await PoliceStation.findAll({
      attributes: [
        'id', 'name', 'city', 'type',
        [sequelize.fn('COUNT', sequelize.col('receivedComplaints.id')), 'totalComplaintsCount']
      ],
      include: [{
        model: Complaint,
        as: 'receivedComplaints',
        attributes: [],
        required: false 
      }],
      group: ['PoliceStation.id', 'PoliceStation.name', 'PoliceStation.city', 'PoliceStation.type'],
      order: [[sequelize.literal('"totalComplaintsCount"'), 'DESC']]
    });

    // 2. Formatage pour le Dashboard mobile
    const formattedStats = stats.map((s: any) => {
      const data = s.get({ plain: true });
      const total = parseInt(data.totalComplaintsCount || '0', 10);

      return {
        ...data,
        totalComplaints: total,
        // Échelle d'activité basée sur le volume (Exemple Niamey vs Régions)
        activityLevel: total > 100 ? 'CRITICAL' : total > 50 ? 'HIGH' : 'NORMAL'
      };
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: formattedStats
    });
  } catch (error: any) {
    console.error("❌ Erreur Dashboard Police :", error.message);
    return res.status(500).json({ success: false, message: "Erreur statistiques police." });
  }
};