"use strict";
const crypto = require("crypto");
const { ComplaintService } = require("../../application/services/complaint.service");
const { DocumentService } = require("../../application/services/document.service");
const { NotificationService } = require("../../application/services/notification.service");
const documentService = new DocumentService();
const notificationService = new NotificationService();
/**
 * AUDIT SIMPLE
 */
const audit = async (req, action) => {
    try {
        const userId = req.user?.id || null;
        const hash = crypto
            .createHash("sha256")
            .update(`${userId}|${action}|${req.method}|${req.originalUrl}|${Date.now()}`)
            .digest("hex");
        await AuditLog.create({
            userId,
            action,
            method: req.method,
            endpoint: req.originalUrl,
            ip: req.ip || "0.0.0.0",
            hash,
            status: "SUCCESS",
        });
    }
    catch (e) {
        console.error("Audit error:", e.message);
    }
};
// ======================================================
// LIST GLOBAL
// ======================================================
const listComplaints = async (req, res) => {
    try {
        const items = await Complaint.findAll({
            order: [["createdAt", "DESC"]],
        });
        await audit(req, "LIST_COMPLAINTS");
        return res.json({ success: true, data: items });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
// ======================================================
// MES PLAINTES
// ======================================================
const getMyComplaints = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Non authentifié" });
        const items = await Complaint.findAll({
            where: { citizenId: req.user.id },
            order: [["createdAt", "DESC"]],
            include: [{ model: Attachment, as: "attachments" }],
        });
        await audit(req, "GET_MY_COMPLAINTS");
        return res.json({ success: true, data: items });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
// ======================================================
// GET ONE
// ======================================================
const getComplaint = async (req, res) => {
    try {
        const item = await Complaint.findByPk(req.params.id, {
            include: [
                { model: User, as: "complainant" },
                { model: PoliceStation, as: "originStation" },
            ],
        });
        if (!item)
            return res.status(404).json({ message: "Introuvable" });
        if (req.user?.role === "citizen" && item.citizenId !== req.user.id) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        await audit(req, "GET_COMPLAINT");
        return res.json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
// ======================================================
// CREATE
// ======================================================
const createComplaint = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Non authentifié" });
        const { title, description, category } = req.body;
        const item = await Complaint.create({
            citizenId: req.user.id,
            title,
            description,
            category,
            status: "soumise",
            filedAt: new Date(),
        });
        await audit(req, `CREATE_COMPLAINT #${item.id}`);
        return res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
// ======================================================
// UPDATE
// ======================================================
const updateComplaint = async (req, res) => {
    try {
        const item = await Complaint.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Introuvable" });
        if (req.user?.role === "citizen" && item.citizenId !== req.user.id) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        const { title, description } = req.body;
        await item.update({
            title: title ?? item.title,
            description: description ?? item.description,
        });
        await audit(req, `UPDATE_COMPLAINT #${item.id}`);
        return res.json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
// ======================================================
// DELETE
// ======================================================
const deleteComplaint = async (req, res) => {
    try {
        const item = await Complaint.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Introuvable" });
        await item.destroy();
        await audit(req, `DELETE_COMPLAINT #${item.id}`);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
// ======================================================
// WORKFLOW TRANSITION (IMPORTANT)
// ======================================================
const transitionComplaint = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const result = await ComplaintService.transition(Number(req.params.id), status, req.user, { reason });
        await audit(req, `TRANSITION_${status}`);
        return res.json({
            success: true,
            data: result.complaint,
            case: result.case || null,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// ======================================================
// TRANSITIONS DISPONIBLES
// ======================================================
const getAvailableTransitions = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: "Introuvable" });
        }
        const transitions = ComplaintService.getAvailableTransitions(complaint, req.user);
        return res.json({ success: true, data: transitions });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ALIAS
const transmitToHierarchy = transitionComplaint;
const validateToParquet = transitionComplaint;
const addAttachment = async (req, res) => {
    try {
        const complaintId = Number(req.params.id);
        const complaint = await Complaint.findByPk(complaintId);
        if (!complaint)
            return res.status(404).json({ message: "Plainte introuvable" });
        // Vérification des droits (citoyen propriétaire ou agent autorisé)
        if (req.user?.role === "citizen" && complaint.citizenId !== req.user.id) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        // Utilisation du DocumentService pour enregistrer la pièce jointe
        const file = req.file; // suppose l'utilisation de multer
        if (!file)
            return res.status(400).json({ message: "Fichier requis" });
        const attachment = await documentService.attachToComplaint(complaintId, file, req.user);
        await audit(req, `ADD_ATTACHMENT #${complaintId}`);
        return res.status(201).json({ success: true, data: attachment });
    }
    catch (error) {
        console.error("Erreur addAttachment:", error);
        return res.status(500).json({ message: error.message || "Erreur serveur" });
    }
};
// EXPORTS
module.exports = {
    listComplaints,
    getMyComplaints,
    getComplaint,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    addAttachment,
    transitionComplaint,
    getAvailableTransitions,
    transmitToHierarchy,
    validateToParquet,
};
