// @ts-nocheck
// src/interfaces/controllers/preventiveDetention.controller.ts
import { Request, Response } from "express";
import PreventiveDetention from "../../models/preventiveDetention.model";

export const createPreventiveDetention = async (req: Request, res: Response) => {
  try {
    const detention = await PreventiveDetention.create(req.body);
    return res.status(201).json(detention);
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la création de la détention préventive." });
  }
};

export const getAllPreventiveDetentions = async (_req: Request, res: Response) => {
  try {
    const detentions = await PreventiveDetention.findAll();
    return res.json(detentions);
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la récupération des détentions." });
  }
};

export const getPreventiveDetentionById = async (req: Request, res: Response) => {
  try {
    const detention = await PreventiveDetention.findByPk(req.params.id);
    if (!detention) return res.status(404).json({ error: "Détention non trouvée." });
    return res.json(detention);
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la récupération." });
  }
};

export const updatePreventiveDetention = async (req: Request, res: Response) => {
  try {
    const [updated] = await PreventiveDetention.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: "Détention non trouvée." });
    const updatedDetention = await PreventiveDetention.findByPk(req.params.id);
    return res.json(updatedDetention);
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
};

export const deletePreventiveDetention = async (req: Request, res: Response) => {
  try {
    const deleted = await PreventiveDetention.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Détention non trouvée." });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
};
