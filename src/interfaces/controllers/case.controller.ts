// @ts-nocheck
import { Response } from "express";
import { Op } from "sequelize";
import CaseModel, { CaseStage } from "../../models/case.model";
import Complaint from "../../models/complaint.model";
import Assignment from "../../models/assignment.model";
import { logActivity } from "../../application/services/audit.service";
import { CustomRequest } from "../../types/express-request";

// 🛡️ Définition des rôles autorisés (Conforme à votre modèle User)
const ROLES = {
  CITIZEN: "citizen",
  POLICE: "police",
  PROSECUTOR: "prosecutor",
  JUDGE: "judge",
  CLERK: "clerk",
  LAWYER: "lawyer",
  ADMIN: "admin",
  PRISON_OFFICER: "prison_officer",
} as const;

// --------------------------------------------------
// 📋 LISTE GLOBALE (Admin uniquement)
// --------------------------------------------------
export const listCases = async (req: CustomRequest, res: Response) => {
  try {
    const items = await CaseModel.findAll({
      include: [{ model: Complaint, as: 'complaint' }], 
      order: [["created_at", "DESC"]], // Utilisation du format underscored si activé
    });

    // Audit de l'accès global par un administrateur
    await logActivity(req, "LIST_ALL_CASES", "Case", "ALL", "info");

    return res.json(items);
  } catch (error) {
    console.error("Error in listCases:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des dossiers" });
  }
};

// --------------------------------------------------
// 🔍 LISTE FILTRÉE (Filtrage automatique par rôle)
// --------------------------------------------------
export const listMyCases = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non autorisé" });

    const { id, role } = user; // Extraction du rôle (userRole)
    let cases: CaseModel[] = [];

    // 1. Pour le CITOYEN : Il ne voit que les dossiers issus de ses propres plaintes
    if (role === ROLES.CITIZEN) {
      const complaints = await Complaint.findAll({
        where: { citizenId: id },
        attributes: ['id']
      });
      const complaintIds = complaints.map((c) => c.id);

      cases = await CaseModel.findAll({
        where: { complaintId: { [Op.in]: complaintIds } },
        include: [{ model: Complaint, as: 'complaint' }],
      });
    } 
    // 2. Pour les PROFESSIONNELS (Police, Juge, Procureur) : Uniquement les dossiers assignés
    else if (role !== ROLES.ADMIN) {
      const assignments = await Assignment.findAll({ 
        where: { userId: id },
        attributes: ['caseId']
      });
      const caseIds = assignments.map((a) => a.caseId);

      cases = await CaseModel.findAll({
        where: { id: { [Op.in]: caseIds } },
        include: [{ model: Complaint, as: 'complaint' }],
      });
    } 
    // 3. Pour l'ADMIN : Redirection vers la liste globale
    else {
      return listCases(req, res);
    }

    await logActivity(req, "LIST_MY_CASES", "Case", "OWN_LIST", "info");
    return res.json(cases);

  } catch (error) {
    console.error("Erreur listMyCases:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// --------------------------------------------------
// 🆕 CRÉATION DE DOSSIER (Initialisation juridique)
// --------------------------------------------------
export const createCase = async (req: CustomRequest, res: Response) => {
  try {
    const { complaintId, type = "criminal" } = req.body;
    const userRole = req.user?.role; // Récupération sécurisée du rôle

    // Détermination de l'étape (stage) initiale selon le rôle créateur
    let initialStage: CaseStage = "police_investigation";
    if (userRole === ROLES.PROSECUTOR) {
      initialStage = "prosecution_review";
    }

    // Génération d'une référence judiciaire (ex: RP-2025-4589)
    const year = new Date().getFullYear();
    const reference = `RP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase = await CaseModel.create({
      complaintId,
      reference,
      stage: initialStage,
      status: "open",
      type,
      openedAt: new Date()
    });

    await logActivity(req, "CREATE_CASE", "Case", newCase.id, "info");

    return res.status(201).json(newCase);
  } catch (error: any) {
    console.error("Erreur createCase:", error);
    return res.status(500).json({ message: "Erreur lors de la création du dossier" });
  }
};

// --------------------------------------------------
// 📑 DÉTAIL D'UNE AFFAIRE
// --------------------------------------------------
export const getCase = async (req: CustomRequest, res: Response) => {
  try {
    const item = await CaseModel.findByPk(req.params.id, {
      include: [{ model: Complaint, as: 'complaint' }],
    });

    if (!item) return res.status(404).json({ message: "Affaire introuvable" });

    // Trace d'audit pour chaque consultation de dossier sensible
    await logActivity(req, "GET_CASE_DETAIL", "Case", item.id, "info");

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// --------------------------------------------------
// 🔄 MISE À JOUR (Transition d'étape / Clôture)
// --------------------------------------------------
export const updateCase = async (req: CustomRequest, res: Response) => {
  try {
    const item = await CaseModel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Affaire introuvable" });

    const { stage, status } = req.body;

    // Préparation des données de mise à jour
    const updateData: any = { 
      stage: stage || item.stage, 
      status: status || item.status 
    };

    // Gestion automatique de la date de clôture si l'affaire est fermée
    if (status && ["closed", "archived"].includes(status) && !item.closedAt) {
      updateData.closedAt = new Date();
    }

    await item.update(updateData);

    await logActivity(req, "UPDATE_CASE", "Case", item.id, "warning");

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
};

// --------------------------------------------------
// 🗑️ SUPPRESSION (Action Critique)
// --------------------------------------------------
export const deleteCase = async (req: CustomRequest, res: Response) => {
  try {
    const item = await CaseModel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Affaire introuvable" });

    await item.destroy();

    // Sévérité critique : la suppression d'un dossier judiciaire est une action lourde
    await logActivity(req, "DELETE_CASE", "Case", req.params.id, "critical");

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};