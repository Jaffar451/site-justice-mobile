import { Response } from "express";
import crypto from "crypto";
// ✅ IMPORT CORRIGÉ : On ajoute Attachment ici
import { Complaint, AuditLog, User, PoliceStation, Attachment } from "../../models";
import { CustomRequest } from "../../types/express-request";
import { DocumentService } from "../../application/services/document.service";
import { NotificationService } from "../../application/services/notification.service";

const documentService = new DocumentService();
const notificationService = new NotificationService();

/**
 * 🔐 SYSTÈME D'AUDIT AVEC SCELLÉ NUMÉRIQUE (SHA-256)
 */
const audit = async (req: CustomRequest, action: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
  try {
    const userId = req.user?.id ?? null;
    const org = req.user?.organization ?? "CITIZEN_SPACE"; 
    const method = req.method.toUpperCase() as any; 
    const endpoint = req.originalUrl || "/";
    const ip = req.ip || "0.0.0.0";
    const timestamp = new Date();

    const dataToHash = `${userId}|${org}|${action}|${method}|${endpoint}|${timestamp.toISOString()}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // 🛡️ SÉCURITÉ RENDER : Correction du crash ENUM 'INFO'
    // Si votre base rejette "INFO", on bascule dynamiquement sur une valeur standard
    const safeSeverity = (severity as string) === 'INFO' ? 'WARNING' : severity;

    await AuditLog.create({
      userId, 
      action: `[${org}] ${action}`, 
      method, 
      endpoint, 
      ip, 
      severity: safeSeverity as any, // Utilise la valeur sécurisée
      status: "SUCCESS",
      details: `Agent/Citoyen: ${req.user?.firstname} ${req.user?.lastname} | Rôle: ${req.user?.role}`,
      timestamp, 
      hash,
    } as any);
  } catch (e) {
    // On log l'erreur mais on ne bloque pas le thread principal de l'utilisateur
    console.error("❌ Échec critique Audit Log (Non-bloquant):", e);
  }
};

// ======================================================
// 📋 SECTION 1 : CONSULTATION ET GESTION TERRITORIALE
// ======================================================

export const listComplaints = async (req: CustomRequest, res: Response) => {
  try {
    const whereClause: any = {};
    const user = req.user;

    if (["police", "commissaire", "gendarme"].includes(user?.role || "") && user?.policeStationId) {
      whereClause.policeStationId = user.policeStationId;
    }

    if (user?.role === "citizen") {
      whereClause.citizenId = user.id; 
    }

    const items = await Complaint.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "complainant", attributes: ["firstname", "lastname", "telephone", "email"] },
        { model: PoliceStation, as: "originStation", attributes: ["name", "city", "type"] }
      ]
    });
    
    await audit(req, "LIST_COMPLAINTS_ACCESS");
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Erreur lors du chargement des dossiers." });
  }
};

export const getComplaint = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 🛡️ SÉCURITÉ : Protection contre l'ID 'undefined'
    if (!id || id === 'undefined' || isNaN(Number(id))) {
       return res.status(400).json({ success: false, message: "ID de dossier invalide." });
    }

    const item = await Complaint.findByPk(id, {
      include: [
        { model: User, as: "complainant", attributes: { exclude: ["password"] } },
        { model: PoliceStation, as: "originStation" }
      ]
    });

    if (!item) return res.status(404).json({ success: false, message: "Dossier introuvable." });

    if (req.user?.role === "citizen" && item.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé : ce dossier ne vous appartient pas." });
    }

    // ✅ RÉCUPÉRATION DES PIÈCES JOINTES (via SEQUELIZE)
    const attachments = await Attachment.findAll({
      where: { complaintId: item.id }
    });

    const responseData = item.toJSON();
    // @ts-ignore
    responseData.attachments = attachments;

    await audit(req, `VIEW_COMPLAINT_DETAIL #${item.id}`);
    return res.json({ success: true, data: responseData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ======================================================
// ⚖️ SECTION 2 : WORKFLOW JUDICIAIRE (POLICE -> PARQUET)
// ======================================================

export const transmitToHierarchy = async (req: CustomRequest, res: Response) => {
  try {
    const item = await Complaint.findByPk(req.params.id);
    if (!item || item.status !== "soumise") {
      return res.status(400).json({ message: "Le dossier n'est pas dans un état transmissible." });
    }

    await item.update({ status: "attente_validation" });
    await audit(req, `TRANSMIT_TO_HIERARCHY #${item.id}`, "INFO");
    
    return res.json({ success: true, message: "Dossier transmis pour validation hiérarchique." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la transmission." });
  }
};

export const validateToParquet = async (req: CustomRequest, res: Response) => {
  try {
    const item: any = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: "complainant" },
        { model: PoliceStation, as: "originStation" }
      ]
    });

    if (!item || item.status !== "attente_validation") {
      return res.status(400).json({ message: "Dossier non prêt pour le Parquet." });
    }

    await item.update({ 
      status: "transmise_parquet", 
      validatedByCommissaire: true 
    });

    try {
        const pdfBuffer = await documentService.generateComplaintPDF(item);
        
        if (item.complainant?.email) {
            await notificationService.sendComplaintReceiptEmail(
                item.complainant.email, 
                item.complainant.firstname, 
                item.trackingCode, 
                pdfBuffer
            ).catch(err => console.error("Erreur envoi email:", err));
        }
    } catch (pdfError) {
        console.error("Erreur génération PDF:", pdfError);
    }

    await audit(req, `PARQUET_TRANSMISSION_SUCCESS #${item.id}`, "CRITICAL");
    return res.json({ success: true, message: "Dossier validé et transmis au Parquet." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la validation finale." });
  }
};

// ======================================================
// 🚀 SECTION 3 : ACTIONS INITIALES (CITOYEN)
// ======================================================

export const createComplaint = async (req: CustomRequest, res: Response) => {
  try {
    const { title, description, category, policeStationId, latitude, longitude } = req.body;
    
    const item = await Complaint.create({
      citizenId: req.user!.id,
      policeStationId: policeStationId || req.user!.policeStationId,
      title,
      description,
      category: category || "general",
      latitude: latitude || null,
      longitude: longitude || null,
      status: "soumise",
    } as any);

    await audit(req, `NEW_COMPLAINT_SUBMITTED #${item.id}`);
    
    return res.status(201).json({ 
      success: true, 
      message: "Plainte enregistrée. Vous recevrez une notification dès sa prise en charge.", 
      data: item 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Échec du dépôt de plainte." });
  }
};

export const getMyComplaints = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
    }

    const complaints = await Complaint.findAll({
      where: { citizenId: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [
        { 
          model: PoliceStation, 
          as: "originStation", 
          required: false,
          attributes: ["name", "city", "district", "type"] 
        }
      ]
    });

    const complaintIds = complaints.map(c => c.id);
    const allAttachments = await Attachment.findAll({
        where: { complaintId: complaintIds },
        attributes: ['id', 'complaintId', 'filename', 'mimeType']
    });

    const finalData = complaints.map(c => {
        const json = c.toJSON();
        // @ts-ignore
        json.attachments = allAttachments.filter(a => a.complaintId === c.id);
        return json;
    });

    await audit(req, `GET_MY_COMPLAINTS_MOBILE (${complaints.length} dossiers)`);
    return res.json({ success: true, data: finalData });
  } catch (error) {
    console.error("❌ Erreur getMyComplaints:", error);
    return res.status(500).json({ success: false, message: "Erreur lors du chargement." });
  }
};

// ======================================================
// 📎 SECTION 4 : GESTION DES PIÈCES JOINTES
// ======================================================

export const addAttachment = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 🛡️ SÉCURITÉ : Protection contre l'ID 'undefined'
    if (!id || id === 'undefined' || isNaN(Number(id))) {
       return res.status(400).json({ message: "ID de plainte invalide pour l'upload." });
    }

    const file = req.file; 
    if (!file) return res.status(400).json({ message: "Aucun fichier fourni." });

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: "Plainte introuvable." });

    const attachment = await Attachment.create({
        filename: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        complaintId: Number(id),
    } as any);

    await audit(req, `ADD_ATTACHMENT #${attachment.id} TO COMPLAINT #${id}`);
    return res.status(201).json({ success: true, message: "Pièce jointe ajoutée.", data: attachment });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de l'upload.", error: error.message });
  }
};

export const updateComplaint = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // 🛡️ SÉCURITÉ : Protection contre l'ID 'undefined'
    if (!id || id === 'undefined' || isNaN(Number(id))) {
       return res.status(400).json({ message: "Identifiant de dossier invalide." });
    }

    const item = await Complaint.findByPk(id);
    if (!item) return res.status(404).json({ message: "Dossier introuvable." });

    if (req.user?.role === "citizen" && item.citizenId !== req.user.id) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    if (item.status !== "soumise") {
      return res.status(400).json({ message: "Le dossier est verrouillé." });
    }

    await item.update({
      title: title || item.title,
      description: description || item.description,
      // @ts-ignore
      updatedAt: new Date(), 
    });

    await audit(req, `UPDATE_COMPLAINT_DETAILS #${id}`);
    return res.json({ success: true, message: "Dossier mis à jour.", data: item });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur." });
  }
};