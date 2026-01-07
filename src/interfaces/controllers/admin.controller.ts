// PATH: src/interfaces/controllers/admin.controller.ts
import { Request, Response } from 'express';
import { User, Complaint, PoliceStation, AuditLog } from '../../models'; // ✅ Assure-toi d'importer les modèles correctement
import { Op, Sequelize } from 'sequelize';

// --- STOCKAGE TEMPORAIRE (SIMULATION) ---
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

/**
 * 📊 RÉCUPÉRER LES STATISTIQUES DU DASHBOARD
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('📊 [Admin] Génération des statistiques...');

    // 1. 🟢 RÉPARTITION PAR STATUT (Sécurisé)
    let statusStats = [];
    try {
      const statusStatsRaw = await Complaint.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('status')), 'status'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      statusStats = statusStatsRaw.map((s: any) => ({
        status: (s.status || 'Inconnu').replace(/_/g, ' ').toUpperCase(),
        count: s.count ? s.count.toString() : "0"
      }));
    } catch (e) {
      console.warn("⚠️ Pas de stats statuts (Table vide ?)");
    }

    // 2. 🔵 RÉPARTITION GÉOGRAPHIQUE (Sécurisé)
    let regionalStats = [];
    try {
      // On vérifie d'abord s'il y a des stations
      const countStations = await PoliceStation.count();
      if (countStations > 0) {
        // Note: Si la colonne 'district' n'existe pas, utilise 'city' à la place
        const groupByCol = 'city'; 
        
        const regionalStatsRaw = await PoliceStation.findAll({
          attributes: [
            groupByCol,
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
          ],
          group: [groupByCol],
          raw: true
        });

        regionalStats = regionalStatsRaw.map((r: any) => ({
          district: r[groupByCol] || 'Non défini',
          total: r.total ? r.total.toString() : "0"
        }));
      }
    } catch (e) {
      console.warn("⚠️ Pas de stats régionales (Table vide ?)");
    }

    // 3. 📈 COMPTEURS GLOBAUX (Promise.all pour la rapidité)
    const [complaints_total, users_total, logs_total] = await Promise.all([
      Complaint.count(),
      User.count(),
      AuditLog.count().catch(() => 0)
    ]);

    // Calculs dérivés
    const closedStatuses = ['classée_sans_suite', 'jugée', 'archivée'];
    const complaints_closed = await Complaint.count({ where: { status: { [Op.in]: closedStatuses } } });
    const complaints_open = complaints_total - complaints_closed;

    const police_users = await User.count({ 
      where: { role: { [Op.in]: ['police', 'commissaire', 'opj', 'gendarme'] } } 
    });

    // 4. ACTIVITÉ RÉCENTE
    const recentActivity = await AuditLog.findAll({
        limit: 5,
        order: [['timestamp', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['firstname', 'lastname', 'role'] }]
    }).catch(() => []);

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        regionalStats,
        timingStats: { avg_days: 14 }, // Donnée simulée pour l'instant
        summary: {
          complaints_total,
          complaints_open,
          complaints_closed,
          users_total,
          police_users,
          systemHealth: '100%'
        },
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur CRITIQUE stats admin:', error);
    // On renvoie des zéros pour ne pas crasher l'appli mobile
    res.json({ 
      success: true,
      data: {
        statusStats: [],
        regionalStats: [],
        summary: { complaints_total: 0, users_total: 0, police_users: 0 },
        recentActivity: []
      }
    });
  }
};

/**
 * 🔐 RÉCUPÉRER LA SÉCURITÉ
 */
export const getSecuritySettings = async (req: Request, res: Response) => {
  res.json({ success: true, data: systemSecurityConfig });
};

/**
 * 🛠️ MAJ SÉCURITÉ
 */
export const updateSecuritySettings = async (req: Request, res: Response) => {
  const updates = req.body;
  systemSecurityConfig = { ...systemSecurityConfig, ...updates };
  res.json({ success: true, message: "Paramètres mis à jour", data: systemSecurityConfig });
};

/**
 * 🚧 STATUT MAINTENANCE
 */
export const getMaintenanceStatus = async (req: Request, res: Response) => {
  res.json({ success: true, data: maintenanceConfig });
};

/**
 * 🚨 MAJ MAINTENANCE
 */
export const setMaintenanceStatus = async (req: Request, res: Response) => {
  const { isActive } = req.body;
  maintenanceConfig.isActive = isActive;
  res.json({ success: true, message: isActive ? "Maintenance activée" : "Système actif", data: maintenanceConfig });
};