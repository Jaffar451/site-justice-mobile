import { Request, Response } from "express";
import ArrestWarrant from "../../models/arrestWarrant.model";

export const createArrestWarrant = async (req: Request, res: Response) => {
  try {
    const { caseId, personName, reason } = req.body;
    const issuingJudgeId = (req as any).user.id;

    if (!caseId || !personName || !reason) {
        return res.status(400).json({ message: "caseId, personName, and reason are required." });
    }

    const warrant = await ArrestWarrant.create({
        caseId,
        personName,
        reason,
        issuingJudgeId,
        issuedAt: new Date()
    });

    return res.status(201).json(warrant);
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating arrest warrant:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du mandat d'arrêt." });
  }
};

export const getArrestWarrants = async (_: Request, res: Response) => {
  try {
    const warrants = await ArrestWarrant.findAll();
    return res.json(warrants);
  } catch (error) {
    console.error("Error fetching arrest warrants:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des mandats d'arrêt." });
  }
};
