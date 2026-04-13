"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
// PATH: src/application/services/document.service.ts
const pdfkit_1 = __importDefault(require("pdfkit"));
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
class DocumentService {
    /**
     * 🛡️ GÉNÉRER L'EMPREINTE NUMÉRIQUE (SIGNATURE SHA-256)
     * On inclut la description et le trackingCode pour garantir l'intégrité du contenu.
     */
    generateDigitalSeal(complaint) {
        const dataToHash = `${complaint.trackingCode}|${complaint.description}|${complaint.citizenId}|${complaint.filedAt}`;
        return crypto.createHash('sha256').update(dataToHash).digest('hex').toUpperCase();
    }
    /**
     * 📄 GÉNÉRER LE RÉCÉPISSÉ DE PLAINTE SÉCURISÉ (PDF)
     */
    async generateComplaintPDF(complaint) {
        return new Promise(async (resolve, reject) => {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Récépissé de plainte - ${complaint.trackingCode}`,
                    Author: 'Ministère de la Justice Niger',
                }
            });
            const chunks = [];
            const digitalSeal = this.generateDigitalSeal(complaint);
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            // --- 🏛️ EN-TÊTE OFFICIEL ---
            doc.fontSize(10).font('Helvetica-Bold').text("RÉPUBLIQUE DU NIGER", { align: 'center' });
            doc.fontSize(8).font('Helvetica').text("Fraternité - Travail - Progrès", { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica-Bold').text("MINISTÈRE DE LA JUSTICE", { align: 'center' });
            doc.fontSize(8).font('Helvetica').text("DIRECTION DE LA MODERNISATION DU SYSTÈME JUDICIAIRE", { align: 'center' });
            // Ligne de séparation
            doc.moveTo(50, 110).lineTo(545, 110).stroke();
            doc.moveDown(2);
            // --- 📜 TITRE ET RÉFÉRENCE ---
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a5a96').text("RÉCÉPISSÉ DE DÉPÔT DE PLAINTE", { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('black').text(`Code de suivi : ${complaint.trackingCode}`, { align: 'center' });
            doc.moveDown(2);
            // --- 👤 SECTION 1 : LE PLAIGNANT ---
            doc.fontSize(11).font('Helvetica-Bold').rect(50, doc.y, 495, 15).fill('#f2f2f2');
            doc.fillColor('black').text(" 1. INFORMATIONS DU PLAIGNANT", 55, doc.y - 12);
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica')
                .text(`Nom & Prénom : ${complaint.citizen?.firstname || '---'} ${complaint.citizen?.lastname || ''}`)
                .text(`Téléphone : ${complaint.citizen?.telephone || 'Non renseigné'}`)
                .text(`Date du dépôt : ${new Date(complaint.filedAt).toLocaleString('fr-FR')}`);
            doc.moveDown();
            // --- 👮 SECTION 2 : L'UNITÉ D'ENQUÊTE ---
            doc.fontSize(11).font('Helvetica-Bold').rect(50, doc.y, 495, 15).fill('#f2f2f2');
            doc.fillColor('black').text(" 2. LIEU D'ENREGISTREMENT", 55, doc.y - 12);
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica')
                .text(`Unité : ${complaint.originStation?.name || '---'}`)
                .text(`Localité : ${complaint.originStation?.city || '---'}`)
                .text(`Qualification provisoire : ${complaint.provisionalOffence || 'En cours d\'analyse'}`);
            doc.moveDown();
            // --- 📝 SECTION 3 : RÉSUMÉ DES FAITS ---
            doc.fontSize(11).font('Helvetica-Bold').rect(50, doc.y, 495, 15).fill('#f2f2f2');
            doc.fillColor('black').text(" 3. DESCRIPTION DES FAITS", 55, doc.y - 12);
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(complaint.description, { align: 'justify', width: 480 });
            doc.moveDown(2);
            // --- 🛡️ ZONE DE SÉCURITÉ ---
            const verifyUrl = `${process.env.FRONTEND_URL || 'https://justice.ne'}/verify/${complaint.verification_token}`;
            try {
                const qrCodeData = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 4 });
                const qrWidth = 90;
                doc.image(qrCodeData, (doc.page.width - qrWidth) / 2, doc.y, { width: qrWidth });
                doc.moveDown(6.5);
            }
            catch (err) {
                console.error("QR Code Gen Error", err);
            }
            // Sceau Numérique
            doc.fontSize(8).font('Courier-Bold').fillColor('#666666').text("SCEAU NUMÉRIQUE D'AUTHENTICITÉ (SHA-256)", { align: 'center' });
            doc.fontSize(7).text(digitalSeal, { align: 'center' });
            // Pied de page
            doc.moveDown(2);
            doc.fontSize(8).font('Helvetica-Oblique').fillColor('#999999')
                .text("Ce document est un titre officiel généré par le système e-Justice Niger. Il fait foi de dépôt de plainte auprès des autorités compétentes. Vous pouvez vérifier l'authenticité de ce document en scannant le QR Code ci-dessus.", { align: 'center' });
            doc.end();
        });
    }
}
exports.DocumentService = DocumentService;
