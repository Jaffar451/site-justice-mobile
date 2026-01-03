import { Request, Response } from "express";
import { Complaint, CaseModel, Hearing, User, PoliceStation } from "../../models";
import { Op } from "sequelize";
import * as QRCode from "qrcode";
import { DocumentService } from "../../application/services/document.service"; // ✅ AJOUT

const documentService = new DocumentService(); // ✅ Initialisation

/**
 * 🔍 1. SUIVI DE PLAINTE / DOSSIER
 */
export const trackAffair = async (req: Request, res: Response) => {
  try {
    const { reference } = req.query; 

    if (!reference) return res.status(400).json({ message: "Référence requise" });

    const searchRef = String(reference);

    const complaint = await Complaint.findOne({
      where: { trackingCode: searchRef },
      attributes: ['status', 'filedAt', 'provisionalOffence']
    });

    if (complaint) {
      return res.json({ 
        type: "PLAINTE", 
        status: complaint.status, 
        date: complaint.filedAt,
        offence: complaint.provisionalOffence 
      });
    }

    const caseItem = await CaseModel.findOne({
      where: { reference: searchRef },
      attributes: ['status', 'stage', 'createdAt']
    });

    if (caseItem) {
      return res.json({ 
        type: "DOSSIER_JUDICIAIRE", 
        status: caseItem.status, 
        stage: caseItem.stage,
        date: caseItem.createdAt 
      });
    }

    return res.status(404).json({ message: "Aucun dossier trouvé pour cette référence" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la recherche" });
  }
};

/**
 * 📄 2. RÉCÉPISSÉ JSON + QR CODE (Pour affichage Web)
 */
export const getComplaintReceipt = async (req: Request, res: Response) => {
  try {
    const { trackingCode } = req.params;

    const complaint = await Complaint.findOne({
      where: { trackingCode },
      include: [{ 
        model: PoliceStation, 
        as: "station", 
        attributes: ["name", "city"] 
      }]
    });

    if (!complaint) return res.status(404).json({ message: "Plainte introuvable" });

    const verifyUrl = `${process.env.FRONTEND_URL || 'https://justice.ne'}/verify/${complaint.verification_token}`;

    const qrCodeBase64 = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    return res.json({
      complaint: {
        trackingCode: complaint.trackingCode,
        filedAt: complaint.filedAt,
        status: complaint.status,
        stationName: complaint.station?.name,
        city: complaint.station?.city
      },
      qrCode: qrCodeBase64
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la génération du récépissé" });
  }
};

/**
 * 📥 3. TÉLÉCHARGER LE RÉCÉPISSÉ PDF (Officiel)
 * ✅ NOUVELLE MÉTHODE
 */
export const downloadComplaintPDF = async (req: Request, res: Response) => {
  try {
    const { trackingCode } = req.params;

    // On récupère toutes les infos nécessaires pour le document officiel
    const complaint = await Complaint.findOne({
      where: { trackingCode },
      include: [
        { model: User, as: "citizen", attributes: ["firstname", "lastname"] },
        { model: PoliceStation, as: "station" }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    // Appel au service de génération PDF
    const pdfBuffer = await documentService.generateComplaintPDF(complaint);

    // Configuration des headers pour forcer le téléchargement du fichier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Recepisse_Plainte_${trackingCode}.pdf`);
    
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Erreur téléchargement PDF:", error.message);
    return res.status(500).json({ message: "Erreur lors de la génération du document PDF" });
  }
};

/**
 * 🗓️ 4. RÔLE D'AUDIENCE PUBLIC
 */
export const getPublicHearingRoll = async (req: Request, res: Response) => {
  try {
    const { courtId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const hearings = await Hearing.findAll({
      where: {
        courtId: Number(courtId),
        date: { [Op.between]: [today, endOfDay] },
        status: "scheduled"
      },
      attributes: ['date', 'courtroom', 'type'],
      include: [{ model: CaseModel, as: "case", attributes: ['reference'] }],
      order: [['date', 'ASC']]
    });

    return res.json(hearings);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération du rôle" });
  }
};

/**
 * 👨‍⚖️ 5. ANNUAIRE DES AVOCATS
 */
export const getLawyersDirectory = async (req: Request, res: Response) => {
  try {
    const lawyers = await User.findAll({
      where: { role: 'lawyer', isActive: true },
      attributes: ['firstname', 'lastname', 'email', 'phone', 'specialization'],
      order: [['lastname', 'ASC']]
    });
    return res.json(lawyers);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération de l'annuaire" });
  }
};