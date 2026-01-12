import { Request, Response } from 'express';
import { User, Complaint, PoliceStation, AuditLog, sequelize } from '../../models'; // ✅ Assurez-vous d'importer 'sequelize' ici
import { Op, Sequelize } from 'sequelize';

// --- STOCKAGE TEMPORAIRE (SIMULATION CONFIG) ---
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
 * 🏥 SANTÉ DU SYSTÈME (INDISPENSABLE POUR AdminMaintenanceScreen)
 * Permet d'afficher "Connected" au lieu de "Unknown"
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  const start = Date.now();
  let dbStatus = 'Disconnected';
  let serverStatus = 'OK';

  try {
    // Test simple de connexion BDD
    await sequelize.authenticate(); 
    dbStatus = 'Connected';
  } catch (error) {
    console.error("❌ Erreur connexion DB:", error);
    dbStatus = 'Disconnected';
    serverStatus = 'Warning';
  }

  const latency = Date.now() - start;

  res.status(200).json({
    success: true,
    data: {
      serverStatus: serverStatus,
      dbStatus: dbStatus,
      latency: latency,
      version: '1.0.5',
      uptime: process.uptime()
    }
  });
};

/**
 * 📜 RÉCUPÉRER LES LOGS SYSTÈME
 */
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']], // ✅ Correct
      limit: 100,
      include: [
        {
          model: User,
          as: 'actor', // ✅ Correct (alias défini dans le modèle)
          attributes: ['id', 'firstname', 'lastname', 'role']
        }
      ]
    });

    // Formatage pour le frontend
    const formattedLogs = logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      method: log.method,
      endpoint: log.endpoint,
      ip: log.ipAddress, // Mapping BDD -> Front
      details: log.details,
      status: parseInt(log.status) || 200,
      timestamp: log.createdAt,
      actor: log.actor ? {
        firstname: log.actor.firstname,
        lastname: log.actor.lastname,
        role: log.actor.role
      } : null
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("❌ Erreur logs:", error);
    res.status(500).json({ message: "Erreur récupération logs" });
  }
};

/**
 * 📊 RÉCUPÉRER LES STATISTIQUES DU DASHBOARD
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. 🟢 RÉPARTITION PAR STATUT
    let statusStats: any[] = [];
    try {
      const statusStatsRaw = await Complaint.findAll({
        attributes: [
          'status',
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
      console.warn("⚠️ Erreur stats statuts", e);
    }

    // 2. 🔵 RÉPARTITION GÉOGRAPHIQUE
    let regionalStats: any[] = [];
    try {
      const countStations = await PoliceStation.count();
      if (countStations > 0) {
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
      console.warn("⚠️ Erreur stats régionales", e);
    }

    // 3. 📈 COMPTEURS GLOBAUX
    let complaints_total = 0;
    let users_total = 0;
    let logs_total = 0;

    try { complaints_total = await Complaint.count(); } catch (e) {}
    try { users_total = await User.count(); } catch (e) {}
    try { logs_total = await AuditLog.count(); } catch (e) {}

    // Calculs dérivés
    const closedStatuses = ['classée_sans_suite', 'jugée', 'archivée', 'cloture'];
    let complaints_closed = 0;
    try {
        complaints_closed = await Complaint.count({ where: { status: { [Op.in]: closedStatuses } } });
    } catch(e) {}
    
    const complaints_open = Math.max(0, complaints_total - complaints_closed);

    let police_users = 0;
    try {
        police_users = await User.count({ 
            where: { role: { [Op.in]: ['police', 'commissaire', 'opj', 'gendarme'] } } 
        });
    } catch(e) {}

    // 4. ACTIVITÉ RÉCENTE
    let recentActivity: any[] = [];
    try {
        recentActivity = await AuditLog.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']], // ✅ Correct
            include: [{ 
                model: User, 
                as: 'actor', // ✅ Correct
                attributes: ['firstname', 'lastname', 'role'],
                required: false 
            }]
        });
    } catch (e) {
        console.warn("⚠️ Impossible de récupérer les logs récents", e);
    }

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
          logs_total,
          systemHealth: '100%'
        },
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur CRITIQUE stats admin:', error);
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
  maintenanceConfig.isActive = !!isActive;
  console.log(`🔧 Mode maintenance ${isActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  res.json({ success: true, message: isActive ? "Maintenance activée" : "Système actif", data: maintenanceConfig });
};