import { Response } from "express";
import { CustomRequest } from "../../types/express-request";
import { WorkflowService } from "../../application/services/workflow.service";

const workflowService = new WorkflowService();

/**
 * 🚔 ACTION : OPJ -> COMMISSAIRE (Transmission pour visa)
 * Route: PATCH /api/complaints/:id/to-commissaire
 */
export const transmitToCommissaire = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Note: Vous devrez implémenter la méthode 'transmitToCommissaire' dans votre WorkflowService
    const updatedComplaint = await workflowService.updateStatus(Number(id), "TRANSMITTED_TO_COMMISSAIRE");

    return res.json({ 
      message: "Dossier transmis avec succès au Commissaire pour visa.",
      data: updatedComplaint 
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 🚔 ACTION : COMMISSAIRE -> PARQUET (Validation finale police)
 * Route: PATCH /api/complaints/:id/to-parquet
 */
export const validateToParquet = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedComplaint = await workflowService.updateStatus(Number(id), "VALIDATED_BY_COMMISSAIRE");

    return res.json({ 
      message: "Dossier validé par le Commissariat et transmis au Parquet Général.",
      data: updatedComplaint 
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ⚖️ ACTION : PROCUREUR -> JUGE (Saisine du Juge d'Instruction)
 * Route: PATCH /api/complaints/:id/assign-judge
 */
export const assignJudge = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { judgeId } = req.body;

    if (!judgeId) {
      return res.status(400).json({ message: "Veuillez spécifier un Juge d'instruction." });
    }

    // Note: Implémentez 'assignToJudge' dans votre service pour gérer la saisine
    const result = await workflowService.assignToJudge(Number(id), Number(judgeId));

    return res.json({ 
      message: "Le Juge d'instruction a été saisi avec succès.",
      data: result 
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ⚖️ ACTION : ENGAGER DES POURSUITES (Procureur)
 * Route: POST /api/workflow/prosecute
 */
export const prosecute = async (req: CustomRequest, res: Response) => {
  try {
    const { complaintId, priority } = req.body;
    const courtId = req.user?.courtId;

    if (!courtId) {
      return res.status(403).json({ message: "Vous devez être rattaché à un tribunal pour engager des poursuites." });
    }

    const newCase = await workflowService.prosecuteComplaint(
      Number(complaintId),
      courtId,
      priority
    );

    return res.status(201).json({
      message: "Poursuites engagées, dossier judiciaire créé.",
      case: newCase
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 📂 ACTION : CLASSEMENT SANS SUITE
 * Route: POST /api/workflow/dismiss
 */
export const dismiss = async (req: CustomRequest, res: Response) => {
  try {
    const { complaintId } = req.body;
    await workflowService.closeComplaint(Number(complaintId));
    
    return res.json({ message: "La plainte a été classée sans suite par le Parquet." });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ⛓️ ACTION : FLAGRANT DÉLIT (Écrou immédiat)
 * Route: POST /api/workflow/flagrant-delict
 */
export const handleFlagrantDelict = async (req: CustomRequest, res: Response) => {
  try {
    const { complaintId, prisonId, detaineeInfo } = req.body;
    const courtId = req.user?.courtId;

    if (!courtId) {
      return res.status(403).json({ message: "Action refusée : tribunal non identifié." });
    }

    const result = await workflowService.flagrantDelictIncarceration({
      complaintId: Number(complaintId),
      prisonId: Number(prisonId),
      detaineeInfo,
      courtId
    });

    return res.status(201).json({
      message: "Dossier créé et mise sous écrou effectuée avec succès.",
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};