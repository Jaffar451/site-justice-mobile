// PATH: src/interfaces/controllers/complaint.controller.ts
import { Response } from "express";
import crypto from "crypto";
import { Complaint, AuditLog, User, PoliceStation } from "../../models";
import { CustomRequest } from "../../types/express-request";
import { DocumentService } from "../../application/services/document.service";
import { NotificationService } from "../../application/services/notification.service";

// ✅ CORRECTION : On instancie Prisma localement pour corriger l'erreur d'import app.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

    await AuditLog.create({
      userId, 
      action: `[${org}] ${action}`, 
      method, 
      endpoint, 
      ip, 
      severity,
      status: "SUCCESS",
      details: `Agent/Citoyen: ${req.user?.firstname} ${req.user?.lastname} | Rôle: ${req.user?.role}`,
      timestamp, 
      hash,
    } as any);
  } catch (e) {
    console.error("❌ Échec critique Audit Log:", e);
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
    const item = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: "complainant", attributes: { exclude: ["password"] } },
        { model: PoliceStation, as: "originStation" }
      ]
    });

    if (!item) return res.status(404).json({ success: false, message: "Dossier introuvable." });

    if (req.user?.role === "citizen" && item.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Accès refusé : ce dossier ne vous appartient pas." });
    }

    // ✅ RÉCUPÉRATION DES PIÈCES JOINTES (via PRISMA)
    // On force l'ajout des attachments à la réponse
    const attachments = await prisma.attachment.findMany({
      where: { complaintId: item.id }
    });

    // Conversion en objet simple pour ajouter la propriété attachments
    const responseData = item.toJSON();
    responseData.attachments = attachments;

    await audit(req, `VIEW_COMPLAINT_DETAIL #${item.id}`);
    return res.json({ success: true, data: responseData });
  } catch (error) {
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
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
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

    // ✅ RÉCUPÉRATION DES PIÈCES JOINTES EN VRAC (OPTIMISATION)
    // On récupère tous les IDs de plaintes
    const complaintIds = complaints.map(c => c.id);
    
    // On cherche toutes les pièces jointes liées à ces plaintes
    const allAttachments = await prisma.attachment.findMany({
        where: { complaintId: { in: complaintIds } },
        select: { id: true, complaintId: true, filename: true, mimeType: true }
    });

    // On fusionne manuellement
    const finalData = complaints.map(c => {
        const json = c.toJSON();
        // On filtre les attachements correspondant à la plainte en cours
        json.attachments = allAttachments.filter(a => a.complaintId === c.id);
        return json;
    });

    await audit(req, `GET_MY_COMPLAINTS_MOBILE (${complaints.length} dossiers)`);
    
    return res.json({ 
      success: true, 
      data: finalData // On renvoie les données enrichies
    });
  } catch (error) {
    console.error("❌ Erreur getMyComplaints:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors du chargement de vos plaintes.",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

// ======================================================
// 📎 SECTION 4 : GESTION DES PIÈCES JOINTES (ADDITION)
// ======================================================

/**
 * Ajouter une pièce jointe (Preuve) à une plainte
 */
export const addAttachment = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const file = req.file; 

    if (!file) {
      return res.status(400).json({ message: "Aucun fichier fourni ou format invalide." });
    }

    // 1. Vérifier si la plainte existe (SEQUELIZE)
    const complaint = await Complaint.findByPk(id);

    if (!complaint) {
      return res.status(404).json({ message: "Plainte introuvable." });
    }

    // 2. Enregistrer dans la table Attachment (PRISMA)
    const attachment = await prisma.attachment.create({
      data: {
        filename: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        complaintId: Number(id),
      },
    });

    await audit(req, `ADD_ATTACHMENT #${attachment.id} TO COMPLAINT #${id}`);

    return res.status(201).json({
      success: true,
      message: "Pièce jointe ajoutée avec succès",
      data: attachment,
    });

  } catch (error: any) {
    console.error("Erreur addAttachment:", error);
    return res.status(500).json({ 
      message: "Erreur serveur lors de l'upload de la preuve",
      error: error.message 
    });
  }
};

// ✅ NOUVELLE FONCTION : Mettre à jour une plainte (Titre / Description)
export const updateComplaint = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.id;

    // 1. Récupérer la plainte
    const item = await Complaint.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: "Dossier introuvable." });
    }

    // 2. Vérifications de sécurité
    // Seul le créateur peut modifier
    if (req.user?.role === "citizen" && item.citizenId !== userId) {
      return res.status(403).json({ message: "Vous ne pouvez pas modifier ce dossier." });
    }

    // On ne peut modifier que si le statut est "soumise"
    if (item.status !== "soumise") {
      return res.status(400).json({ message: "Le dossier est verrouillé par les services de police." });
    }

    // 3. Mise à jour
    await item.update({
      title: title || item.title,
      description: description || item.description,
      // @ts-ignore : Sequelize gère updatedAt auto mais on force pour le refresh
      updatedAt: new Date(), 
    });

    await audit(req, `UPDATE_COMPLAINT_DETAILS #${id}`);

    return res.json({ 
      success: true, 
      message: "Dossier mis à jour avec succès.",
      data: item 
    });

  } catch (error) {
    console.error("Erreur updateComplaint:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
};