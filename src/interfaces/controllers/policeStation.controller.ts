import { Request, Response } from "express";
import PoliceStation from "../../models/policeStation.model";

// Utilitaire pour extraire un ID valide de req.params.id
const getId = (id: string | string[]): string | number => {
  const value = Array.isArray(id) ? id[0] : id;
  // Convertit en nombre si possible, sinon garde la chaîne
  return isNaN(Number(value)) ? value : Number(value);
};

// 1. Récupérer toutes les stations
export const getAllStations = async (_: Request, res: Response) => {
  try {
    const stations = await PoliceStation.findAll();
    return res.json({ success: true, data: stations });
  } catch (error) {
    console.error("Error in getAllStations:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des stations" });
  }
};

// 2. Récupérer une station par son ID
export const getStationById = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const station = await PoliceStation.findByPk(id as any);
    if (!station) return res.status(404).json({ message: "Station introuvable" });
    return res.json({ success: true, data: station });
  } catch (error) {
    console.error("Error in getStationById:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// 3. Créer une nouvelle station
export const createStation = async (req: Request, res: Response) => {
  try {
    const station = await PoliceStation.create(req.body);
    return res.status(201).json({ success: true, data: station });
  } catch (error) {
    console.error("Error in createStation:", error);
    return res.status(500).json({ message: "Erreur lors de la création" });
  }
};

// 4. Mettre à jour une station
export const updateStation = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const station = await PoliceStation.findByPk(id as any);
    if (!station) return res.status(404).json({ message: "Station introuvable" });
    await station.update(req.body);
    return res.json({ success: true, data: station });
  } catch (error) {
    console.error("Error in updateStation:", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// 5. Supprimer une station
export const deleteStation = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const station = await PoliceStation.findByPk(id as any);
    if (!station) return res.status(404).json({ message: "Station introuvable" });
    await station.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error in deleteStation:", error);
    return res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};