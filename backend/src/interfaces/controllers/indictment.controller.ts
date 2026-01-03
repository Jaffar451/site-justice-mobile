// src/interfaces/controllers/indictment.controller.ts
import { Request, Response } from "express";
import Indictment from "../../models/indictment.model";

export async function createIndictment(req: Request, res: Response) {
  try {
    const indictment = await Indictment.create(req.body);
    return res.status(201).json(indictment);
  } catch (error) {
    return res.status(500).json({ message: "Erreur création mise en accusation", error });
  }
}

export async function getIndictment(req: Request, res: Response) {
  try {
    const indictment = await Indictment.findByPk(req.params.id);
    if (!indictment) return res.status(404).json({ message: "Non trouvée" });
    return res.json(indictment);
  } catch (error) {
    return res.status(500).json({ message: "Erreur récupération", error });
  }
}

export async function updateIndictment(req: Request, res: Response) {
  try {
    const indictment = await Indictment.findByPk(req.params.id);
    if (!indictment) return res.status(404).json({ message: "Non trouvée" });

    await indictment.update(req.body);
    return res.json(indictment);
  } catch (error) {
    return res.status(500).json({ message: "Erreur mise à jour", error });
  }
}

export async function deleteIndictment(req: Request, res: Response) {
  try {
    const indictment = await Indictment.findByPk(req.params.id);
    if (!indictment) return res.status(404).json({ message: "Non trouvée" });

    await indictment.destroy();
    return res.json({ message: "Supprimée" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur suppression", error });
  }
}
