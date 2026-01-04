// @ts-nocheck
// src/interfaces/controllers/interrogation.controller.ts
import { Request, Response } from "express";
import Interrogation from "../../models/interrogation.model";

export const createInterrogation = async (req: Request, res: Response) => {
  try {
    const interrogation = await Interrogation.create(req.body);
    return res.status(201).json(interrogation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur création", error: err });
  }
};

export const getAllInterrogations = async (_: Request, res: Response) => {
  try {
    const interrogations = await Interrogation.findAll();
    return res.json(interrogations);
  } catch (err) {
    return res.status(500).json({ message: "Erreur récupération", error: err });
  }
};

export const getInterrogation = async (req: Request, res: Response) => {
  try {
    const interrogation = await Interrogation.findByPk(req.params.id);
    if (!interrogation) return res.status(404).json({ message: "Non trouvée" });
    return res.json(interrogation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur", error: err });
  }
};

export const updateInterrogation = async (req: Request, res: Response) => {
  try {
    const interrogation = await Interrogation.findByPk(req.params.id);
    if (!interrogation) return res.status(404).json({ message: "Non trouvée" });
    await interrogation.update(req.body);
    return res.json(interrogation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur MAJ", error: err });
  }
};

export const deleteInterrogation = async (req: Request, res: Response) => {
  try {
    const interrogation = await Interrogation.findByPk(req.params.id);
    if (!interrogation) return res.status(404).json({ message: "Non trouvée" });
    await interrogation.destroy();
    return res.json({ message: "Supprimée" });
  } catch (err) {
    return res.status(500).json({ message: "Erreur suppression", error: err });
  }
};
