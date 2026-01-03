// @ts-nocheck
import { Response } from "express";
import { CustomRequest } from "../../types/express-request";
import { Hearing, CaseModel, User } from "../../models";
import { Op, WhereOptions } from "sequelize";
import { HearingAttributes } from "../../models/hearing.model";

/**
 * 🗓️ LISTER LES AUDIENCES (Calendrier)
 */
export const listHearings = async (req: CustomRequest, res: Response) => {
  try {
    const whereClause: WhereOptions<HearingAttributes> = {};
    
    if (req.user?.courtId && req.user.role !== "admin") {
      whereClause.courtId = req.user.courtId;
    }

    const items = await Hearing.findAll({
      where: whereClause,
      include: [
        { model: CaseModel, as: "case", attributes: ["reference", "description"] },
        { model: User, as: "judge", attributes: ["firstname", "lastname"] }
      ],
      order: [["date", "ASC"]],
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la récupération du calendrier" });
  }
};

/**
 * 📂 LISTER LES AUDIENCES D'UN DOSSIER SPÉCIFIQUE
 */
export const listHearingsByCase = async (req: CustomRequest, res: Response) => {
  try {
    const caseId = Number(req.params.caseId);

    const items = await Hearing.findAll({
      where: { caseId },
      order: [["date", "DESC"]], 
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération de l'historique" });
  }
};

/**
 * ✍️ CRÉER UNE AUDIENCE (Planification)
 */
export const createHearing = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !["judge", "clerk", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { caseId, date, type, courtroom, durationMinutes, notes, judgeId } = req.body;

    const caseExists = await CaseModel.findByPk(caseId);
    if (!caseExists) {
      return res.status(404).json({ message: "Dossier judiciaire introuvable" });
    }

    const item = await Hearing.create({
      caseId: Number(caseId),
      courtId: user.courtId || Number(req.body.courtId), 
      judgeId: judgeId ? Number(judgeId) : (user.role === "judge" ? user.id : null),
      date: new Date(date),
      type,
      courtroom,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      notes,
      status: "scheduled",
    });

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la planification" });
  }
};

/**
 * 🔍 DÉTAILS D'UNE AUDIENCE
 */
export const getHearing = async (req: CustomRequest, res: Response) => {
  try {
    const item = await Hearing.findByPk(req.params.id, {
      include: ["case", "judge"]
    });
    if (!item) return res.status(404).json({ message: "Audience introuvable" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🔄 METTRE À JOUR UNE AUDIENCE
 */
export const updateHearing = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !["judge", "clerk", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const item = await Hearing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Audience introuvable" });

    if (user.role !== "admin" && item.courtId !== user.courtId) {
      return res.status(403).json({ message: "Autorisation refusée pour ce tribunal" });
    }

    await item.update(req.body);
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

/**
 * 🗑️ SUPPRIMER UNE AUDIENCE
 */
export const deleteHearing = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Action réservée aux administrateurs" });
    }

    const item = await Hearing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Audience introuvable" });

    await item.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

/**
 * 📄 GÉNÉRER LE RÔLE D'AUDIENCE DU JOUR
 * ✅ FIX : Correction du typage de courtId pour éviter l'erreur TS2322
 */
export const getDailyRoll = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    
    // Conversion explicite en nombre pour satisfaire TypeScript et Sequelize
    const rawCourtId = user?.courtId || req.query.courtId;
    const courtId = Number(rawCourtId);

    if (!courtId || isNaN(courtId)) {
      return res.status(400).json({ message: "ID du tribunal valide requis." });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const roll = await Hearing.findAll({
      where: {
        courtId: courtId,
        date: { [Op.between]: [startOfDay, endOfDay] },
        status: { [Op.ne]: "canceled" } 
      },
      include: [
        { model: CaseModel, as: "case", attributes: ["reference", "description"] },
        { model: User, as: "judge", attributes: ["firstname", "lastname"] }
      ],
      order: [
        ["courtroom", "ASC"],
        ["date", "ASC"] 
      ]
    });

    return res.json({
      courtId,
      date: startOfDay.toISOString().split('T')[0],
      totalHearings: roll.length,
      hearings: roll
    });
  } catch (error: any) {
    console.error("Erreur DailyRoll:", error.message);
    return res.status(500).json({ message: "Erreur lors de la génération du rôle d'audience" });
  }
};