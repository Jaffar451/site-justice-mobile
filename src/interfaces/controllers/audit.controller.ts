import { Request, Response } from "express";
import { Op } from "sequelize";
import { AuditLog, User } from "../../models";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { severity, action, search, startDate, endDate, method, endpoint } = req.query;

    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (severity) whereClause.severity = severity;
    if (method) whereClause.method = method;
    if (action) whereClause.action = { [Op.iLike]: `%${action}%` };
    if (endpoint) whereClause.endpoint = { [Op.iLike]: `%${endpoint}%` };

    // ✅ Recherche globale sur ipAddress (mappé vers ip_address)
    if (search) {
      whereClause[Op.or] = [
        { details: { [Op.iLike]: `%${search}%` } },
        { endpoint: { [Op.iLike]: `%${search}%` } },
        { action: { [Op.iLike]: `%${search}%` } },
        { ipAddress: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate as string);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: User, 
        as: 'operator', 
        attributes: ['id', 'firstname', 'lastname', 'role', 'organization'] 
      }]
    });

    return res.json({
      success: true,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      },
      data: rows
    });

  } catch (error: any) {
    console.error("❌ [AuditController Error]:", error);
    return res.status(500).json({ 
      success: false,
      message: "Erreur lors du chargement des journaux d'audit.",
      error: error.message 
    });
  }
};