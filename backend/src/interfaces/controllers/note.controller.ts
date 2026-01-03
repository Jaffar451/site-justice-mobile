import { Request, Response } from "express";
import Note from "../../models/note.model";
import Assignment from "../../models/assignment.model";
import Complaint from "../../models/complaint.model";
import CaseModel from "../../models/case.model";

const ROLES_ALLOWED = ["police", "prosecutor", "judge", "clerk", "admin"];

const ensureAuthorized = (user: any): void => {
  if (!user || !ROLES_ALLOWED.includes(user.role)) {
    throw new Error("ACCESS_DENIED");
  }
};

const ensureCaseAccess = async (user: any, caseId: number): Promise<boolean> => {
  if (!user) throw new Error("ACCESS_DENIED");

  if (user.role === "admin") return true;

  if (user.role === "citizen") throw new Error("ACCESS_DENIED");

  const caseItem = await CaseModel.findByPk(caseId, { include: [Complaint] });
  if (!caseItem) throw new Error("NOT_FOUND");

  const a = await Assignment.findOne({
    where: { caseId, userId: user.id },
  });

  if (!a) throw new Error("ACCESS_DENIED");
  
  return true;
};

export const listNotes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    ensureAuthorized(user);

    const caseId = Number(req.query.caseId);
    if (!caseId) {
      return res.status(400).json({ message: "caseId requis" });
    }

    await ensureCaseAccess(user, caseId);

    const items = await Note.findAll({
      where: { caseId },
      order: [["createdAt", "DESC"]],
    });
    return res.json(items);
  } catch (e: any) {
    return res.status(e.message === "ACCESS_DENIED" ? 403 : 404).json({ message: "Accès interdit" });
  }
};

export const createNote = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    ensureAuthorized(user);

    const { caseId, content, visibility = "case_global" } = req.body;
    if (!caseId || !content) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    await ensureCaseAccess(user, caseId);

    const item = await Note.create({
      caseId,
      userId: user.id,
      content,
      visibility,
    });

    return res.status(201).json(item);
  } catch (e: any) {
    return res.status(e.message === "ACCESS_DENIED" ? 403 : 404).json({ message: "Accès interdit" });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    ensureAuthorized(user);

    const item = await Note.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Note introuvable" });
    }

    await ensureCaseAccess(user, item.caseId);

    if (item.userId !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Non modifiable" });
    }

    await item.update(req.body);
    return res.json(item);
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<Response> => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Réservé admin" });
  }
  const item = await Note.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Note introuvable" });
  }

  await item.destroy();
  return res.status(204).send();
};

export const getNote = async (req: Request, res: Response): Promise<Response> => {
  const item = await Note.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Note introuvable" });
  }
  return res.json(item);
};