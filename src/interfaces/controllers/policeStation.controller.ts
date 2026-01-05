// PATH: backend/src/interfaces/controllers/police-station.controller.ts
import { Request, Response } from "express";
// ✅ On importe depuis l'index global des modèles (plus propre)
import { PoliceStation } from "../../models"; 

/**
 * 📥 RÉCUPÉRER TOUTES LES UNITÉS
 */
export const getAllStations = async (req: Request, res: Response) => {
  try {
    const stations = await PoliceStation.findAll({ 
      order: [['city', 'ASC'], ['name', 'ASC']] 
    });
    return res.status(200).json({ success: true, data: stations });
  } catch (error: any) {
    console.error("Erreur getAllStations:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

/**
 * 🔍 RÉCUPÉRER UNE UNITÉ PAR ID
 * (Manquait dans ton code, mais nécessaire pour le mobile)
 */
export const getStationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const station = await PoliceStation.findByPk(id);

    if (!station) {
      return res.status(404).json({ success: false, message: "Unité introuvable." });
    }

    return res.status(200).json({ success: true, data: station });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

/**
 * ✨ CRÉER UNE UNITÉ
 */
export const createStation = async (req: Request, res: Response) => {
  try {
    const newStation = await PoliceStation.create(req.body);
    return res.status(201).json({ success: true, data: newStation });
  } catch (error: any) {
    console.error("Erreur createStation:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la création." });
  }
};

/**
 * 📝 METTRE À JOUR
 */
export const updateStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const station = await PoliceStation.findByPk(id);
    
    if (!station) {
      return res.status(404).json({ success: false, message: "Introuvable" });
    }
    
    await station.update(req.body);
    return res.status(200).json({ success: true, data: station });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Erreur mise à jour." });
  }
};

/**
 * 🗑️ SUPPRIMER
 */
export const deleteStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await PoliceStation.destroy({ where: { id } });
    
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Unité introuvable ou déjà supprimée." });
    }

    return res.status(200).json({ success: true, message: "Unité supprimée avec succès." });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Erreur suppression." });
  }
};