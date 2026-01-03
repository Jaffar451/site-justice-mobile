// @ts-nocheck
import { Response } from "express";
import { CustomRequest } from "../../types/express-request";
import { Decision, CaseModel, User, Court } from "../../models";
import {sequelize} from "../../config/database";

/**
 * 🔹 LISTER LES DÉCISIONS
 * Filtrées par tribunal pour le personnel judiciaire
 */
export const listDecisions = async (req: CustomRequest, res: Response) => {
  try {
    const whereClause: any = {};
    if (req.user?.courtId && req.user.role !== "admin") {
      whereClause.courtId = req.user.courtId;
    }

    const items = await Decision.findAll({
      where: whereClause,
      include: [
        { model: CaseModel, as: "case", attributes: ["reference", "status"] },
        { model: User, as: "judge", attributes: ["firstname", "lastname"] }
      ],
      order: [["date", "DESC"]]
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération des décisions" });
  }
};

/**
 * 🔹 DÉCISIONS PAR AFFAIRE
 */
export const listDecisionsByCase = async (req: CustomRequest, res: Response) => {
  try {
    const { caseId } = req.params;
    const items = await Decision.findAll({
      where: { caseId: Number(caseId) },
      include: [{ model: User, as: "judge", attributes: ["firstname", "lastname"] }]
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * ✍️ CRÉATION DÉCISION
 */
export const createDecision = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !["judge", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Seul un juge peut rendre une décision" });
    }

    const {
      caseId, verdict, type, legalBasis,
      sentenceYears, sentenceMonths, fineAmount, decisionNumber
    } = req.body;

    const caseItem = await CaseModel.findByPk(caseId);
    if (!caseItem) return res.status(404).json({ message: "Affaire introuvable" });

    // Génération auto du numéro si absent
    const num = decisionNumber || `DEC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const item = await Decision.create({
      caseId: Number(caseId),
      courtId: user.courtId || caseItem.courtId, // On attache au tribunal du juge
      judgeId: user.id,
      verdict,
      type,
      legalBasis,
      sentenceYears: sentenceYears ? Number(sentenceYears) : 0,
      sentenceMonths: sentenceMonths ? Number(sentenceMonths) : 0,
      fineAmount: fineAmount ? Number(fineAmount) : 0,
      decisionNumber: num,
      date: new Date(),
    });

    return res.status(201).json(item);
  } catch (error: any) {
    console.error("Erreur createDecision:", error.message);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement du verdict" });
  }
};

/**
 * 🖋️ SIGNATURE ET CLÔTURE DE L'AFFAIRE
 * Utilise une transaction pour garantir l'intégrité
 */
export const signDecision = async (req: CustomRequest, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const user = req.user;
    if (!user || user.role !== "judge") {
      return res.status(403).json({ message: "Seul le juge président peut signer la minute" });
    }

    const item = await Decision.findByPk(req.params.id, { transaction: t });
    if (!item) {
        await t.rollback();
        return res.status(404).json({ message: "Décision introuvable" });
    }

    if (item.signedBy) {
      await t.rollback();
      return res.status(400).json({ message: "Cette décision est déjà signée et revêtue de la formule exécutoire" });
    }

    // 1. Apposer la signature
    await item.update({ signedBy: `${user.firstname} ${user.lastname}` }, { transaction: t });

    // 2. Clôturer l'affaire et passer au stade exécution
    await CaseModel.update(
      {
        status: "closed",
        stage: "execution", // Passe du tribunal à l'exécution de la peine
        closedAt: new Date()
      },
      { where: { id: item.caseId }, transaction: t }
    );

    await t.commit();
    return res.json({ message: "Décision signée. L'affaire est désormais close.", item });
  } catch (error: any) {
    await t.rollback();
    return res.status(500).json({ message: "Erreur lors de la signature" });
  }
};

/**
 * 🔍 CONSULTATION
 */
export const getDecision = async (req: CustomRequest, res: Response) => {
  const item = await Decision.findByPk(req.params.id, { include: ["case", "judge", "court"] });
  if (!item) return res.status(404).json({ message: "Décision introuvable" });
  return res.json(item);
};

/**
 * 🔄 MODIFICATION (Uniquement si non signée)
 */
export const updateDecision = async (req: CustomRequest, res: Response) => {
  const item = await Decision.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Décision introuvable" });

  if (item.signedBy) {
    return res.status(403).json({ message: "Impossible de modifier une décision déjà signée" });
  }

  await item.update(req.body);
  return res.json(item);
};

/**
 * 🗑️ SUPPRESSION (Admin uniquement)
 */
export const deleteDecision = async (req: CustomRequest, res: Response) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Action réservée à l'administrateur" });
  
  const item = await Decision.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Décision introuvable" });

  await item.destroy();
  return res.status(204).send();
};