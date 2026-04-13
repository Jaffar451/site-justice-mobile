// src/interfaces/controllers/auditLog.controller.ts
import { Request, Response } from "express";
import { AuditLog } from "../../models";

// ⚠️ Les noms doivent correspondre EXACTEMENT à l'import dans audit.routes.ts

export const ListAuditLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await AuditLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100, // Optionnel : pagination
    });
    return res
      .status(200)
      .json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error("Erreur ListAuditLogs:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: String(error),
      });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    // Note : le nom de la route est "getAuditLogs" mais elle gère un seul log par ID
    const log = await AuditLog.findByPk(req.params.id as string);
    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: "Log d'audit introuvable" });
    }
    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error("Erreur getAuditLogs:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: String(error),
      });
  }
};
