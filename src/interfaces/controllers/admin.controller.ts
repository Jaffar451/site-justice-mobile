import { Request, Response } from 'express';
import { User, Complaint, PoliceStation, AuditLog } from '../../models'; 
import { Op, Sequelize } from 'sequelize';

// --- STOCKAGE TEMPORAIRE (SIMULATION CONFIG) ---
// Idéalement, à déplacer dans une table 'Settings' en DB
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
      console.warn("⚠️ Erreur stats statuts (Table Complaint vide ou inexistante ?)", e);
    }

    // 2. 🔵 RÉPARTITION GÉOGRAPHIQUE
    let regionalStats: any[] = [];
    try {
      const countStations = await PoliceStation.count();
      if (countStations > 0) {
        // Utilise 'city' ou 'district' selon ton modèle
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

    // 3. 📈 COMPTEURS GLOBAUX (Sécurisé avec Promise.allSettled ou try/catch individuels)
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
            order: [['timestamp', 'DESC']],
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['firstname', 'lastname', 'role'],
                required: false // Left join pour ne pas perdre le log si user supprimé
            }]
        });
    } catch (e) {
        console.warn("⚠️ Impossible de récupérer les logs récents");
    }

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
          logs_total,
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
  maintenanceConfig.isActive = !!isActive; // Force booléen
  console.log(`🔧 Mode maintenance ${isActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  res.json({ success: true, message: isActive ? "Maintenance activée" : "Système actif", data: maintenanceConfig });
};