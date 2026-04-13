import { Request, Response } from "express";
// Assurez-vous d'importer le bon modèle selon votre structure (auditLog.model.ts)
import Log from "../../models/auditLog.model";


export const listLogs = async (req: Request, res: Response) => {
  try {
    const logs = await Log.findAll({
      order: [["timestamp", "DESC"]],
    });
    return res.json(logs);
  } catch (error) {
    console.error("Error in listLogs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLog = async (req: Request, res: Response) => {
  try {
    // Correction : forcer le typage en 'string' pour satisfaire Sequelize
    const logId = req.params.id as string;

    const item = await Log.findByPk(logId);
    if (!item) {
      return res.status(404).json({ message: "Log introuvable" });
    }
    return res.json(item);
  } catch (error) {
    console.error("Error in getLog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
