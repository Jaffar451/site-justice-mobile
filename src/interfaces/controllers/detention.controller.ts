// @ts-nocheck
import { Request, Response } from "express";
import Detention from "../../models/detention.model";

export const createDetention = async (req: Request, res: Response) => {
  try {
    const detention = await Detention.create(req.body);
    return res.status(201).json(detention);
  } catch (error) {
    return res.status(500).json({ error: "Échec de création de la détention" });
  }
};

export const getDetention = async (req: Request, res: Response) => {
  try {
    const detention = await Detention.findByPk(req.params.id);
    if (!detention) return res.status(404).json({ message: "Non trouvée" });
    return res.json(detention);
  } catch (error) {
    return res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const updateDetention = async (req: Request, res: Response) => {
  try {
    const detention = await Detention.findByPk(req.params.id);
    if (!detention) return res.status(404).json({ message: "Non trouvée" });
    await detention.update(req.body);
    return res.json(detention);
  } catch (error) {
    return res.status(500).json({ error: "Échec de la mise à jour" });
  }
};

export const deleteDetention = async (req: Request, res: Response) => {
  try {
    const detention = await Detention.findByPk(req.params.id);
    if (!detention) return res.status(404).json({ message: "Non trouvée" });
    await detention.destroy();
    return res.json({ message: "Supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({ error: "Erreur de suppression" });
  }
};

export const getAllDetentions = async (_: Request, res: Response) => {
  try {
    const detentions = await Detention.findAll();
    return res.json(detentions);
    } catch (error) {
    return res.status(500).json({ error: "Erreur de récupération des détentions" });
  }
};