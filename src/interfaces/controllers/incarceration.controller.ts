import { Response } from "express";
import { Detainee, Incarceration, Prison, CaseModel } from "../../models";
import { CustomRequest } from "../../types/express-request";
import {sequelize} from "../../config/database";
import { Op } from "sequelize";

/**
 * 📥 ENTRÉE EN PRISON (Mise sous écrou)
 */
export const registerEntry = async (req: CustomRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      firstname, lastname, birthDate, gender, nationality, niu,
      prisonId, caseId, releaseDate, cellNumber, observation 
    } = req.body;

    // 1. Gestion de l'individu (Détenu) via NIU (Indispensable au Niger)
    let detainee;
    if (niu) {
      detainee = await Detainee.findOne({ where: { niu }, transaction });
    }

    if (!detainee) {
      detainee = await Detainee.create({
        firstname, lastname, birthDate, gender, nationality, niu
      }, { transaction });
    }

    // 2. Création du dossier d'incarcération (Écrou)
    const incarceration = await Incarceration.create({
      detaineeId: detainee.id,
      prisonId: prisonId || req.user?.prisonId, 
      caseId: caseId || null,
      entryDate: new Date(),
      releaseDate, // Date calculée si déjà condamné ou estimation
      cellNumber,
      observation,
      status: "preventive" 
    }, { transaction });

    await transaction.commit();

    const result = await Incarceration.findByPk(incarceration.id, {
      include: [
        { model: Detainee, as: "detainee" },
        { model: Prison, as: "prison" }
      ]
    });

    return res.status(201).json(result);
  } catch (error: any) {
    await transaction.rollback();
    return res.status(500).json({ message: "Erreur lors de la mise sous écrou : " + error.message });
  }
};

/**
 * 📅 TABLEAU DE BORD : LIBÉRATIONS À VENIR (30 jours)
 */
export const getUpcomingReleases = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    const prisonId = user?.prisonId || req.query.prisonId;

    if (!prisonId && user?.role !== "admin") {
      return res.status(403).json({ message: "Vous devez être rattaché à une prison pour voir ce rapport." });
    }

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    const releases = await Incarceration.findAll({
      where: {
        prisonId: prisonId ? Number(prisonId) : { [Op.not]: null },
        status: "convicted", 
        releaseDate: { [Op.between]: [today, nextMonth] }
      },
      include: [
        { model: Detainee, as: "detainee", attributes: ["firstname", "lastname", "niu"] },
        { model: CaseModel, as: "case", attributes: ["reference"] }
      ],
      order: [["releaseDate", "ASC"]]
    });

    return res.json({
      period: "30 prochains jours",
      count: releases.length,
      data: releases
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la génération du tableau des sorties." });
  }
};

/**
 * 📋 LISTER LE REGISTRE D'ÉCROU (Détenus présents)
 */
export const listInmates = async (req: CustomRequest, res: Response) => {
  try {
    const whereClause: any = { status: ["preventive", "convicted"] }; 
    
    // Un agent ou régisseur ne voit que sa propre prison
    if (req.user?.prisonId && req.user.role !== "admin") {
      whereClause.prisonId = req.user.prisonId;
    }

    const inmates = await Incarceration.findAll({
      where: whereClause,
      include: [
        { model: Detainee, as: "detainee" },
        { model: CaseModel, as: "case", attributes: ["reference"] }
      ],
      order: [["entryDate", "DESC"]]
    });

    return res.json(inmates);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération du registre." });
  }
};

/**
 * 🔓 LIBÉRATION (Levée d'écrou)
 */
export const releaseDetainee = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { observation } = req.body;

    const incarceration = await Incarceration.findByPk(id);
    if (!incarceration) return res.status(404).json({ message: "Dossier d'écrou introuvable" });

    await incarceration.update({
      actualReleaseDate: new Date(),
      status: "released",
      observation: observation || `Libération effectuée le ${new Date().toLocaleDateString()}`
    });

    return res.json({ message: "Levée d'écrou enregistrée." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la libération." });
  }
};

/**
 * 🔄 TRANSFERT DE PRISON (Changement d'établissement)
 */
export const transferDetainee = async (req: CustomRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; 
    const { newPrisonId, reason } = req.body;

    const oldIncarceration = await Incarceration.findByPk(id);
    if (!oldIncarceration) throw new Error("Dossier actuel introuvable");

    // 1. Clôturer l'écrou dans la prison de départ
    await oldIncarceration.update({
      status: "released",
      actualReleaseDate: new Date(),
      observation: `TRANSFÉRÉ vers établissement ID ${newPrisonId}. Motif : ${reason}`
    }, { transaction });

    // 2. Ouvrir un nouvel écrou dans la prison de destination
    const newIncarceration = await Incarceration.create({
      detaineeId: oldIncarceration.detaineeId,
      prisonId: newPrisonId,
      caseId: oldIncarceration.caseId,
      entryDate: new Date(),
      status: oldIncarceration.status, // Garde son statut (Préventif ou Condamné)
      observation: `Arrivée par transfert depuis établissement ID ${oldIncarceration.prisonId}. ${reason}`
    }, { transaction });

    await transaction.commit();
    return res.json({ message: "Transfert réussi.", newIncarcerationId: newIncarceration.id });
  } catch (error: any) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
};