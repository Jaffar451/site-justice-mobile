import { Request, Response } from 'express';
import { User, Complaint, PoliceStation, AuditLog, sequelize } from '../../models'; 
import { Op, Sequelize } from 'sequelize';

// --- CONFIGURATION (SIMULATION) ---
// À terme, ces configs pourraient être en base de données
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
 * 🏥 SANTÉ DU SYSTÈME (Health Check)
 * Utilisé par l'écran "Maintenance" pour les voyants d'état.
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  const start = Date.now();
  let dbStatus = 'Disconnected';
  let serverStatus = 'OK';

  try {
    // Test réel de connexion à la base de données
    await sequelize.authenticate(); 
    dbStatus = 'Connected';
  } catch (error) {
    console.error("❌ Erreur Health Check DB:", error);
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
 * Utilisé par l'écran "Flux Système".
 */
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100, // On limite aux 100 derniers logs pour la performance
      include: [
        {
          model: User,
          as: 'actor', // Alias défini dans le modèle AuditLog
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
      ip: log.ipAddress,
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
    res.status(500).json({ message: "Erreur lors de la récupération des logs." });
  }
};

/**
 * 📊 RÉCUPÉRER LES STATISTIQUES DU DASHBOARD
 * Utilisé par l'écran d'accueil Admin.
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. 🟢 RÉPARTITION PAR STATUT (Pour le PieChart)
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

    // 2. 🔵 RÉPARTITION GÉOGRAPHIQUE (Pour le BarChart)
    let regionalStats: any[] = [];
    try {
      const countStations = await PoliceStation.count();
      if (countStations > 0) {
        // Adaptez 'city' selon votre modèle (peut être 'district' ou 'region')
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

    // 3. 📈 COMPTEURS GLOBAUX (KPIs)
    let complaints_total = 0;
    let users_total = 0;
    let logs_total = 0;

    // Utilisation de try/catch individuels pour ne pas tout bloquer si une table échoue
    try { complaints_total = await Complaint.count(); } catch (e) {}
    try { users_total = await User.count(); } catch (e) {} // ✅ C'est ici qu'on compte les utilisateurs
    try { logs_total = await AuditLog.count(); } catch (e) {}

    // Calculs dérivés pour l'activité
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

    // 4. ACTIVITÉ RÉCENTE (Optionnel)
    let recentActivity: any[] = [];
    try {
        recentActivity = await AuditLog.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ 
                model: User, 
                as: 'actor', 
                attributes: ['firstname', 'lastname', 'role'],
                required: false 
            }]
        });
    } catch (e) {
        console.warn("⚠️ Impossible de récupérer les logs récents", e);
    }

    // ✅ RÉPONSE FINALE
    res.status(200).json({
      success: true,
      data: {
        statusStats,
        regionalStats,
        timingStats: { avg_days: 14 }, // Donnée simulée (ou à calculer)
        summary: {
          complaints_total,
          complaints_open,
          complaints_closed,
          users_total, // ✅ Envoyé au frontend (sera mappé vers usersCount)
          police_users,
          logs_total,
          systemHealth: maintenanceConfig.isActive ? 'Maintenance' : '100%'
        },
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur CRITIQUE stats admin:', error);
    // Retour de secours pour ne pas crasher l'appli mobile
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
 * 🚧 STATUT MAINTENANCE (GET)
 */
export const getMaintenanceStatus = async (req: Request, res: Response) => {
  res.json({ success: true, data: maintenanceConfig });
};

/**
 * 🚨 MAJ MAINTENANCE (POST)
 */
export const setMaintenanceStatus = async (req: Request, res: Response) => {
  const { isActive } = req.body;
  maintenanceConfig.isActive = !!isActive;
  console.log(`🔧 Mode maintenance ${isActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  res.json({ success: true, message: isActive ? "Maintenance activée" : "Système actif", data: maintenanceConfig });
};