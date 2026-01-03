import { Response } from "express";
import { AuditLog, User } from "../../models"; // Import centralisé recommandé
import { CustomRequest } from "../../types/express-request";

/**
 * 📜 RÉCUPÉRATION DES LOGS SYSTÈME
 * Utilisé par le tableau de bord Admin pour surveiller l'activité en temps réel.
 */
export const getLogs = async (req: CustomRequest, res: Response) => {
  try {
    // 1. Paramètres de pagination pour la performance
    const limit = parseInt(req.query.limit as string) || 100;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    // 2. Requête avec jointure vers l'utilisateur (opérateur)
    const logs = await AuditLog.findAll({
      order: [["createdAt", "DESC"]], // ✅ Utilise createdAt au lieu de timestamp
      limit: limit,
      offset: offset,
      include: [{ 
        model: User, 
        as: "operator", // ✅ Alias harmonisé avec audit.controller
        attributes: ["firstname", "lastname", "role", "organization"] 
      }],
    });

    // 3. Retourne les données
    return res.json({
      success: true,
      count: logs.length,
      data: logs
    });

  } catch (error: any) {
    console.error("❌ [LOG_CONTROLLER_ERROR]:", error.message);
    
    // Aide au débogage si une colonne manque encore en BDD
    if (error.message.includes("column")) {
        return res.status(500).json({ 
            message: "Erreur de structure de base de données (colonne manquante).",
            error: error.message 
        });
    }

    return res.status(500).json({ message: "Erreur lors de la récupération des journaux." });
  }
};