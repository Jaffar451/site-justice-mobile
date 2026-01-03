import { Response } from "express";
import path from "path";
import fs from "fs";
import { Complaint, ComplaintFile, User } from "../../models";
import { CustomRequest } from "../../types/express-request";

/**
 * 📤 1. UPLOAD DE PREUVE
 * Enregistre le fichier et lie les métadonnées à la plainte
 */
export const uploadEvidence = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });
    const { id } = req.params;

    // Vérifier si la plainte existe
    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: "Plainte parente introuvable" });

    const file = await ComplaintFile.create({
      complaintId: Number(id),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    return res.status(201).json({ message: "Preuve ajoutée avec succès", file });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'upload" });
  }
};

/**
 * 📋 2. LISTER LES PREUVES (SÉCURISÉ)
 * Vérifie si l'utilisateur a le droit de voir la liste des pièces
 */
export const listEvidence = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: "Plainte introuvable" });

    // Vérification des droits d'accès à la liste
    const isOwner = user?.role === 'citizen' && complaint.citizenId === user.id;
    const isPoliceInStation = user?.role === 'police' && complaint.policeStationId === user.policeStationId;
    const isMagistrate = ['prosecutor', 'judge', 'commisaire'].includes(user?.role || '');
    
    if (!isOwner && !isPoliceInStation && !isMagistrate && user?.role !== 'admin') {
      return res.status(403).json({ message: "Vous n'avez pas l'autorisation de consulter ces pièces." });
    }

    const files = await ComplaintFile.findAll({ where: { complaintId: id } });
    return res.json(files);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 📥 3. TÉLÉCHARGER / VISUALISER (SÉCURISÉ)
 * Sert le fichier physique après vérification des permissions
 */
export const downloadEvidence = async (req: CustomRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const user = req.user;

    const file = await ComplaintFile.findByPk(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    const complaint = await Complaint.findByPk(file.complaintId);
    if (!complaint) return res.status(404).json({ message: "Plainte associée introuvable" });

    // 🛡️ Logique de restriction d'accès
    const canAccess = 
      user?.role === 'admin' || 
      (user?.role === 'citizen' && complaint.citizenId === user.id) ||
      (user?.role === 'police' && complaint.policeStationId === user.policeStationId) ||
      (['prosecutor', 'judge', 'commisaire'].includes(user?.role || ''));

    if (!canAccess) {
      return res.status(403).json({ message: "Accès refusé à cette pièce à conviction." });
    }

    const absolutePath = path.resolve(file.path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "Fichier physique manquant sur le serveur." });
    }

    // Définit le type MIME correct pour le navigateur
    res.setHeader('Content-Type', file.mimeType);
    return res.sendFile(absolutePath);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération du fichier" });
  }
};