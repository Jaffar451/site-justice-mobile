// @ts-nocheck
import { Response } from "express";
import { z } from "zod";
import Summon from "../../models/summon.model";
import Complaint from "../../models/complaint.model";
import User from "../../models/user.model";
import { CustomRequest } from "../../types/express-request"; // ✅ Typage propre
import { logActivity } from "../../application/services/audit.service"; // ✅ Audit obligatoire

// Schema de validation strict
const createSchema = z.object({
  complaintId: z.number(),
  targetName: z.string(),
  targetPhone: z.string().optional(),
  scheduledAt: z.string().datetime(), // Attend un format ISO (ex: 2025-12-25T10:00:00Z)
  location: z.string(),
  reason: z.string().optional(),
});

// --------------------------------------------------
// 🆕 CRÉATION D'UNE CONVOCATION
// --------------------------------------------------
export const createSummon = async (req: CustomRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const officerId = req.user?.id; // Extraction via CustomRequest

    const complaint = await Complaint.findByPk(data.complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Plainte introuvable" });
    }

    const summon = await Summon.create({
      complaintId: data.complaintId,
      targetName: data.targetName,
      targetPhone: data.targetPhone,
      location: data.location,
      reason: data.reason,
      scheduledAt: new Date(data.scheduledAt),
      issuedBy: officerId || null,
    });

    // ✅ TRACE D'AUDIT : Important pour prouver l'émission de l'acte
    await logActivity(req, "CREATE_SUMMON", "Summon", summon.id, "info");

    return res.status(201).json(summon);
  } catch (err) {
    console.error("Erreur createSummon:", err);
    return res.status(400).json({ message: "Requête invalide", error: err });
  }
};

// --------------------------------------------------
// 📋 LISTE TOUTES LES CONVOCATIONS (Vue Administrative)
// --------------------------------------------------
export const listSummons = async (req: CustomRequest, res: Response) => {
  try {
    const summons = await Summon.findAll({
      include: [
        { model: Complaint, as: "complaint" },
        {
          model: User,
          as: "officer",
          attributes: ["id", "firstname", "lastname", "role"],
        },
      ],
      order: [["scheduled_at", "DESC"]], // Sequelize utilise le nom underscored en interne
    });

    await logActivity(req, "LIST_SUMMONS", "Summon", "ALL", "info");

    return res.json(summons);
  } catch (err) {
    console.error("Erreur listSummons:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// --------------------------------------------------
// 🔍 CONVOCATIONS D'UNE PLAINTE SPÉCIFIQUE
// --------------------------------------------------
export const getSummonsByComplaint = async (req: CustomRequest, res: Response) => {
  try {
    const { complaintId } = req.params;
    
    if (!complaintId) {
      return res.status(400).json({ message: "ID de la plainte manquant." });
    }

    const id = parseInt(complaintId, 10);
    if (isNaN(id)) return res.status(400).json({ message: "ID de la plainte invalide." });

    const summons = await Summon.findAll({ 
      where: { complaintId: id },
      include: ["officer"]
    });

    await logActivity(req, "GET_SUMMONS_BY_COMPLAINT", "Summon", id, "info");

    return res.json(summons);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// --------------------------------------------------
// 🔄 MISE À JOUR DU STATUT (Réception, Remise...)
// --------------------------------------------------
export const updateSummonStatus = async (req: CustomRequest, res: Response) => {
  try {
    const summon = await Summon.findByPk(req.params.id);
    if (!summon) return res.status(404).json({ message: "Convocation non trouvée" });

    const { status } = req.body;
    const validStatuses = ["envoyée", "reçue", "non_remise", "ignorée", "effectuée", "reportée"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    summon.status = status as any;
    await summon.save();

    // ✅ AUDIT : On trace qui a marqué la convocation comme effectuée ou ignorée
    await logActivity(req, "UPDATE_SUMMON_STATUS", "Summon", summon.id, "warning");

    return res.json(summon);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};