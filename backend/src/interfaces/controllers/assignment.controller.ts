// PATH: src/interfaces/controllers/assignment.controller.ts
import { Request, Response } from "express";
import Assignment from "../../models/assignment.model";
import CaseModel from "../../models/case.model";
import User from "../../models/user.model";

/**
 * LISTE ➜ Autorisé : Admin + Justice Agents
 */
export const listAssignments = async (_req: Request, res: Response) => {
  const items = await Assignment.findAll({
    include: [
      { model: CaseModel, attributes: ["id", "reference", "stage"] },
      { model: User, attributes: ["id", "firstname", "lastname", "role"] },
    ],
    order: [["assignedAt", "DESC"]],
  });
  return res.json(items);
};

/**
 * CRÉATION ➜ Police + Procureur + Admin
 * - Ajoute un acteur judiciaire au dossier
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { caseId, userId, role } = req.body;

    if (!caseId || !userId || !role) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const item = await Assignment.create({
      caseId,
      userId,
      role,
      assignedAt: new Date(),
    });

    return res.status(201).json(item);

  } catch (error) {
    console.error("Erreur createAssignment:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * CONSULTATION
 */
export const getAssignment = async (req: Request, res: Response) => {
  const item = await Assignment.findByPk(req.params.id, {
    include: [{ model: User }, { model: CaseModel }],
  });

  if (!item)
    return res.status(404).json({ message: "Affectation introuvable" });

  return res.json(item);
};

/**
 * MISE À JOUR ➜ Police + Procureur + Juge + Admin
 */
export const updateAssignment = async (req: Request, res: Response) => {
  const item = await Assignment.findByPk(req.params.id);
  if (!item)
    return res.status(404).json({ message: "Affectation introuvable" });

  await item.update(req.body);
  return res.json(item);
};

/**
 * SUPPRESSION ➜ Admin uniquement
 */
export const deleteAssignment = async (req: Request, res: Response) => {
  const item = await Assignment.findByPk(req.params.id);
  if (!item)
    return res.status(404).json({ message: "Affectation introuvable" });

  await item.destroy();
  return res.status(204).send();
};
