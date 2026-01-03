import { Response } from "express";
import { CustomRequest } from "../../types/express-request";
import { Sentence, Decision, CaseModel, User } from "../../models";
import { WhereOptions } from "sequelize";
import { SentenceAttributes } from "../../models/sentence.model";
import { SentenceService } from "../../application/services/sentence.service"; // ✅ AJOUT

const sentenceService = new SentenceService(); // ✅ Initialisation

/**
 * 📜 LISTER LES PEINES (Sentences)
 */
export const getSentences = async (req: CustomRequest, res: Response) => {
  try {
    const whereClause: WhereOptions<SentenceAttributes> = {};
    
    if (req.user?.courtId && req.user.role !== "admin") {
      whereClause.courtId = req.user.courtId;
    }

    const records = await Sentence.findAll({
      where: whereClause,
      include: [
        { model: CaseModel, as: "case", attributes: ["reference"] },
        { model: Decision, as: "decision", attributes: ["decisionNumber", "verdict"] },
        { model: User, as: "judge", attributes: ["firstname", "lastname"] }
      ],
      order: [["sentenceDate", "DESC"]]
    });
    
    return res.json(records);
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la récupération des peines" });
  }
};

/**
 * ✍️ CRÉER UNE PEINE ET DÉCLENCHER L'EXÉCUTION
 */
export const createSentence = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !["judge", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Action réservée aux magistrats du siège" });
    }

    const {
      caseId, decisionId, firmYears, firmMonths, firmDays,
      suspendedYears, suspendedMonths, fineAmount, damagesAmount,
      sentenceDate, observations
    } = req.body;

    // 1. Vérifier si la décision existe et est signée
    const decision = await Decision.findByPk(decisionId);
    if (!decision) return res.status(404).json({ message: "Décision judiciaire introuvable" });
    if (!decision.signedBy) {
      return res.status(400).json({ message: "Impossible de créer une peine avant la signature de la minute par le juge" });
    }

    // 2. Création de la sentence en base de données
    const record = await Sentence.create({
      caseId: Number(caseId),
      decisionId: Number(decisionId),
      courtId: user.courtId || decision.courtId,
      judgeId: user.id,
      firmYears: Number(firmYears || 0),
      firmMonths: Number(firmMonths || 0),
      firmDays: Number(firmDays || 0),
      suspendedYears: Number(suspendedYears || 0),
      suspendedMonths: Number(suspendedMonths || 0),
      fineAmount: Number(fineAmount || 0),
      damagesAmount: Number(damagesAmount || 0),
      sentenceDate: sentenceDate || new Date(),
      status: "pending",
      observations
    });

    // 🔥 3. AUTOMATISATION : Mise à jour du milieu pénitentiaire
    // Si la peine comporte de la prison ferme, on met à jour le statut du détenu
    let incarcerationUpdate = null;
    if (record.firmYears > 0 || record.firmMonths > 0 || record.firmDays > 0) {
      incarcerationUpdate = await sentenceService.executeSentence(record.id);
    }

    return res.status(201).json({
      message: incarcerationUpdate 
        ? "Peine enregistrée et statut du détenu mis à jour (Condamné)." 
        : "Peine enregistrée (sans incarcération ferme).",
      record,
      incarcerationStatus: incarcerationUpdate ? "updated" : "none"
    });

  } catch (error: any) {
    console.error("Erreur createSentence:", error);
    return res.status(500).json({ message: error.message || "Erreur lors de l'enregistrement de la peine" });
  }
};

/**
 * 🔍 DÉTAILS D'UNE PEINE
 */
export const getSentence = async (req: CustomRequest, res: Response) => {
  try {
    const record = await Sentence.findByPk(req.params.id, {
      include: ["case", "decision", "judge", "court"]
    });
    if (!record) return res.status(404).json({ message: "Peine introuvable" });
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🔄 MODIFIER UNE PEINE
 */
export const updateSentence = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    const record = await Sentence.findByPk(req.params.id);
    
    if (!record) return res.status(404).json({ message: "Peine introuvable" });
    if (user?.role !== "admin" && record.courtId !== user?.courtId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await record.update(req.body);

    // ✅ Optionnel : On peut relancer executeSentence si les années de prison ont changé
    if (record.firmYears > 0 || record.firmMonths > 0 || record.firmDays > 0) {
        await sentenceService.executeSentence(record.id);
    }

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la modification" });
  }
};

/**
 * 🗑️ SUPPRIMER UNE PEINE
 */
export const deleteSentence = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Seul un administrateur peut supprimer une sentence" });
    }

    const record = await Sentence.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Peine introuvable" });

    await record.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};