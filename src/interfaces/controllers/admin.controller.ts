import { Request, Response } from 'express';
import User from '../../models/user.model';
import Complaint from '../../models/complaint.model';
import PoliceStation from '../../models/policeStation.model';
import { Op, Sequelize } from 'sequelize';

// --- STOCKAGE TEMPORAIRE (SIMULATION DB) ---
// En production, déplacez ces données dans une table "SystemSettings"
let systemSecurityConfig = {
  minLength: 8,
  requireSpecialChar: true,
  requireNumbers: true,
  expirationDays: 90,
  maxLoginAttempts: 5
};

let maintenanceConfig = {
  isActive: false
};

export class AdminController {

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES DU DASHBOARD
   */
  public async getDashboardStats(req: Request, res: Response) {
    try {
      console.log('📊 Début génération Dashboard Stats...');

      // 1. 🟢 RÉPARTITION PAR STATUT
      const statusStatsRaw = await Complaint.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('status')), 'status'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const statusStats = statusStatsRaw.map((s: any) => ({
        status: s.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        count: s.count.toString()
      }));

      // 2. 🔵 RÉPARTITION RÉGIONALE
      const regionalStatsRaw = await PoliceStation.findAll({
        attributes: [
          'district',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
        ],
        group: ['district'],
        raw: true
      });

      const regionalStats = regionalStatsRaw.map((r: any) => ({
        district: r.district || 'Non défini',
        total: r.total.toString()
      }));

      // 3. 📈 COMPTEURS GLOBAUX
      const complaints_total = await Complaint.count();
      const closedStatuses = ['classée_sans_suite_par_OPJ', 'classée_sans_suite_par_procureur', 'jugée', 'non_lieu'];
      const complaints_closed = await Complaint.count({ where: { status: { [Op.in]: closedStatuses } } });
      const complaints_open = complaints_total - complaints_closed;

      const users_total = await User.count();
      const police_users = await User.count({ 
        where: { role: { [Op.in]: ['police', 'commissaire', 'opj', 'gendarme'] } } 
      });

      res.status(200).json({
        success: true,
        data: {
          statusStats,
          regionalStats,
          timingStats: { avg_days: 14 },
          summary: {
            complaints_total,
            complaints_open,
            complaints_closed,
            users_total,
            police_users,
            systemHealth: '100%'
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur stats admin:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la génération des statistiques',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  }

  /**
   * 🔐 RÉCUPÉRER LA POLITIQUE DE SÉCURITÉ
   * Route: GET /api/admin/settings/security
   */
  public async getSecuritySettings(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        data: systemSecurityConfig
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur récupération paramètres" });
    }
  }

  /**
   * 🛠️ METTRE À JOUR LA POLITIQUE DE SÉCURITÉ
   * Route: PUT /api/admin/settings/security
   */
  public async updateSecuritySettings(req: Request, res: Response) {
    try {
      const updates = req.body;
      // Fusionner les nouvelles configs
      systemSecurityConfig = { ...systemSecurityConfig, ...updates };
      
      console.log("🔒 Politique de sécurité mise à jour :", systemSecurityConfig);

      res.status(200).json({
        success: true,
        message: "Politique mise à jour",
        data: systemSecurityConfig
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur mise à jour paramètres" });
    }
  }

  /**
   * 🚧 RÉCUPÉRER LE STATUT MAINTENANCE
   * Route: GET /api/admin/maintenance
   */
  public async getMaintenanceStatus(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        data: maintenanceConfig
      });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }

  /**
   * 🚨 ACTIVER/DÉSACTIVER LA MAINTENANCE
   * Route: POST /api/admin/maintenance
   */
  public async setMaintenanceStatus(req: Request, res: Response) {
    try {
      const { isActive } = req.body;
      maintenanceConfig.isActive = isActive;

      console.log(`⚠️ Maintenance système : ${isActive ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`);

      res.status(200).json({
        success: true,
        message: isActive ? "Maintenance activée" : "Système rétabli",
        data: maintenanceConfig
      });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }
}