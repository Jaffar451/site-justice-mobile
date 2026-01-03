import { Response } from "express";
import { Prison, User } from "../../models";
import { CustomRequest } from "../../types/express-request";

/**
 * 📋 Lister toutes les prisons
 */
export const listPrisons = async (_req: CustomRequest, res: Response) => {
  try {
    const prisons = await Prison.findAll({
      include: [{ model: User, as: "staff", attributes: ["id", "firstname", "lastname"] }]
    });
    return res.json(prisons);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération des prisons" });
  }
};

/**
 * 🔍 Obtenir une prison spécifique
 */
export const getPrison = async (req: CustomRequest, res: Response) => {
  try {
    const prison = await Prison.findByPk(req.params.id);
    if (!prison) return res.status(404).json({ message: "Établissement non trouvé" });
    return res.json(prison);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🚀 Créer une nouvelle prison (ADMIN uniquement)
 */
export const createPrison = async (req: CustomRequest, res: Response) => {
  try {
    const prison = await Prison.create(req.body);
    return res.status(201).json(prison);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la création" });
  }
};

/**
 * 🔄 Mettre à jour une prison
 */
export const updatePrison = async (req: CustomRequest, res: Response) => {
  try {
    const prison = await Prison.findByPk(req.params.id);
    if (!prison) return res.status(404).json({ message: "Établissement non trouvé" });
    await prison.update(req.body);
    return res.json(prison);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};