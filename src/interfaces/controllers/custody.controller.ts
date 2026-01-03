// src/interfaces/controllers/custody.controller.ts
import { Request, Response } from "express";
import Custody from "../../models/custody.model";

export const createCustody = async (req: Request, res: Response) => {
  try {
    const custody = await Custody.create(req.body);
    return res.status(201).json(custody);
  } catch (err) {
    return res.status(500).json({ message: "Erreur création", error: err });
  }
};

export const getAllCustodies = async (_: Request, res: Response) => {
  try {
    const custodies = await Custody.findAll();
    return res.json(custodies);
  } catch (err) {
    return res.status(500).json({ message: "Erreur récupération", error: err });
  }
};

export const getCustody = async (req: Request, res: Response) => {
  try {
    const custody = await Custody.findByPk(req.params.id);
    if (!custody) return res.status(404).json({ message: "Non trouvée" });
    return res.json(custody);
  } catch (err) {
    return res.status(500).json({ message: "Erreur", error: err });
  }
};

export const updateCustody = async (req: Request, res: Response) => {
  try {
    const custody = await Custody.findByPk(req.params.id);
    if (!custody) return res.status(404).json({ message: "Non trouvée" });
    await custody.update(req.body);
    return res.json(custody);
  } catch (err) {
    return res.status(500).json({ message: "Erreur MAJ", error: err });
  }
};

export const deleteCustody = async (req: Request, res: Response) => {
  try {
    const custody = await Custody.findByPk(req.params.id);
    if (!custody) return res.status(404).json({ message: "Non trouvée" });
    await custody.destroy();
    return res.json({ message: "Supprimée" });
  } catch (err) {
    return res.status(500).json({ message: "Erreur suppression", error: err });
  }
};
