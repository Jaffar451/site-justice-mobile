"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaint_model_1 = __importDefault(require("../../models/complaint.model"));
const router = (0, express_1.Router)();
router.get('/verify/:token', async (req, res) => {
    try {
        const complaint = await complaint_model_1.default.findOne({
            where: { verification_token: req.params.token },
            attributes: ['id', 'status', 'filedAt', 'provisionalOffence', 'location']
        });
        if (!complaint)
            return res.status(404).send("Document Invalide");
        res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Document Authentique</h1>
        <p>Numéro : <strong>${complaint.id}</strong> | Statut : <strong>${complaint.status}</strong></p>
        <hr/><p>Ministère de la Justice - Niger</p>
      </div>
    `);
    }
    catch (error) {
        res.status(500).send("Erreur serveur");
    }
});
exports.default = router;
