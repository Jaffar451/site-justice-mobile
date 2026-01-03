import { Request, Response } from "express";
import { EvidenceService } from "../../application/services/evidence.service";
import { MulterRequest } from "../../types/multer-request";

const evidenceService = new EvidenceService();

/**
 * 📋 Liste toutes les preuves (Admin / Supervision)
 */
export const listEvidence = async (_req: Request, res: Response) => {
  try {
    const items = await evidenceService.getEvidenceByCase(0); 
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

/**
 * 📌 Citoyen/Officier → Voir ses propres preuves
 */
export const listMyEvidence = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Non autorisé" });

  try {
    const items = await evidenceService.getEvidenceByCase(user.id); 
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🚀 Création de preuve
 */
export const createEvidence = async (req: Request, res: Response) => {
  try {
    const r = req as MulterRequest;
    const { caseId, type, description } = req.body;
    const user = (req as any).user;

    if (!user) return res.status(401).json({ message: "Non authentifié" });
    if (!caseId) return res.status(400).json({ message: "CaseId requis" });
    if (!type) return res.status(400).json({ message: "Type requis" });
    if (!r.file) return res.status(400).json({ message: "Fichier requis" });

    const item = await evidenceService.addEvidence({
      caseId: Number(caseId),
      uploaderId: user.id,
      description: description || "",
      type: type,
      fileUrl: `/uploads/evidence/${r.file.filename}`,
      filename: r.file.originalname,
      hash: r.file.filename,
    });

    return res.status(201).json(item);
  } catch (error: any) {
    console.error("Erreur création preuve:", error.message);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement" });
  }
};

/**
 * 🔍 Récupérer une preuve par ID
 */
export const getEvidence = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // ✅ Utilisation de findByPk (à adapter selon votre EvidenceService)
    const item = await evidenceService.getEvidenceById(id); 
    if (!item) return res.status(404).json({ message: "Preuve introuvable" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * ✅ AJOUTÉ : Modification de preuve
 * C'est cette fonction qui manquait et faisait planter le serveur !
 */
export const updateEvidence = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    
    // Appel au service pour mettre à jour la description ou le type
    const updated = await evidenceService.updateEvidence(id, data);
    
    if (!updated) return res.status(404).json({ message: "Preuve introuvable" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

/**
 * 🗑️ Suppression de preuve
 */
export const deleteEvidence = async (req: Request, res: Response) => {
  try {
    const success = await evidenceService.deleteEvidence(Number(req.params.id));
    if (!success) return res.status(404).json({ message: "Preuve introuvable" });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};