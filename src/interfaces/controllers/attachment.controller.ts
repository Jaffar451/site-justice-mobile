import { Request, Response } from "express";
import Attachment from "../../models/attachment.model";
import CaseModel from "../../models/case.model";

export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { caseId, fileUrl, filename } = req.body;

    if (!user) return res.status(401).json({ message: "Non authentifié" });

    if (!caseId || !fileUrl || !filename) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const caseItem = await CaseModel.findByPk(caseId);
    if (!caseItem) {
      console.error("📌 Affaire introuvable pour caseId:", caseId);
      return res.status(404).json({ message: "Affaire introuvable" });
    }

    const item = await Attachment.create({
      caseId,
      fileUrl,
      filename,
      uploadedBy: user.id,
    });

    return res.status(201).json(item);
  } catch (error: any) {
    console.error("🚨 ERREUR uploadAttachment:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const listAttachments = async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const items = await Attachment.findAll({ where: { caseId } });
    return res.json(items);
  } catch (error) {
    console.error("🚨 ERREUR listAttachments:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const item = await Attachment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Introuvable" });

    await item.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("🚨 ERREUR deleteAttachment:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
