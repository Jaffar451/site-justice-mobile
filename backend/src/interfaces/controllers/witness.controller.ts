// PATH: src/interfaces/controllers/witness.controller.ts
import { Response } from "express";
import Witness from "../../models/witness.model"; // Assure-toi que ce modèle existe
import { CustomRequest } from "../../types/express-request";

// 1. CRÉER
export const createWitness = async (req: CustomRequest, res: Response) => {
  try {
    const { hearingId, fullName, statement } = req.body;
    
    const newWitness = await Witness.create({
      hearingId, // Lié à une audience
      fullName,
      statement,
      // createdBy: req.user?.id // Optionnel si ton modèle le supporte
    });

    res.status(201).json(newWitness);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout du témoin" });
  }
};

// 2. LISTER
export const getWitnesses = async (req: CustomRequest, res: Response) => {
  try {
    const witnesses = await Witness.findAll({ order: [['createdAt', 'DESC']] });
    res.json(witnesses);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};