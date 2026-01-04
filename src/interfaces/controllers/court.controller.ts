// @ts-nocheck
import { Response } from "express";
import Court from "../../models/court.model";
import { CustomRequest } from "../../types/express-request";

/**
 * 📋 GET /api/courts
 * Lister tous les tribunaux et cours
 */
export const listCourts = async (req: CustomRequest, res: Response) => {
  try {
    const courts = await Court.findAll({
      order: [["city", "ASC"], ["name", "ASC"]]
    });
    return res.json(courts);
  } catch (error) {
    console.error("Erreur listCourts:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des juridictions" });
  }
};

/**
 * 🔍 GET /api/courts/:id
 * Récupérer les détails d'une juridiction spécifique
 */
export const getCourt = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const court = await Court.findByPk(id);
    
    if (!court) {
      return res.status(404).json({ message: "Juridiction introuvable" });
    }
    
    return res.json(court);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🚀 POST /api/courts
 * Créer une nouvelle juridiction (TPI, TGI, Cour d'Appel...)
 */
export const createCourt = async (req: CustomRequest, res: Response) => {
  try {
    const { name, city, location, jurisdiction, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Le nom du tribunal est requis" });
    }

    const court = await Court.create({
      name,
      // Priorité à 'city', sinon 'location', sinon Niamey par défaut
      city: city || location || "Niamey",
      jurisdiction: jurisdiction || "Ressort Local", 
      type: type || "TPI", 
      status: "active"
    });

    return res.status(201).json(court);
  } catch (error) {
    console.error("Erreur createCourt:", error);
    return res.status(500).json({ message: "Erreur lors de la création de la juridiction" });
  }
};

/**
 * 🔄 PUT /api/courts/:id
 * Mettre à jour les informations d'une juridiction
 */
export const updateCourt = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, city, location, jurisdiction, type, status } = req.body;

    const court = await Court.findByPk(id);
    if (!court) {
      return res.status(404).json({ message: "Juridiction introuvable" });
    }

    await court.update({
      name: name || court.name,
      city: city || location || court.city,
      jurisdiction: jurisdiction || court.jurisdiction,
      type: type || court.type,
      status: status || court.status
    });

    return res.json(court);
  } catch (error) {
    console.error("Erreur updateCourt:", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

/**
 * 🗑️ DELETE /api/courts/:id
 * Supprimer une juridiction
 */
export const deleteCourt = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const court = await Court.findByPk(id);

    if (!court) {
      return res.status(404).json({ message: "Tribunal introuvable" });
    }

    // Optionnel : Vérifier si des utilisateurs sont encore rattachés avant de supprimer
    await court.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Erreur deleteCourt:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};