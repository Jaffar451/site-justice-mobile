"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
// PATH: src/application/services/export.service.ts
const exceljs_1 = __importDefault(require("exceljs"));
class ExportService {
    /**
     * 📊 GÉNÉRATION EXCEL : SITUATION PÉNITENTIAIRE NATIONALE
     * @param data - Tableau d'objets formatés par le Scheduler ou le Controller
     * @returns Promise<Buffer> - Buffer compatible avec Nodemailer et Express
     */
    async generatePrisonExcel(data) {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Situation Pénitentiaire');
        // 1. Configuration des colonnes (Alignement avec les clés du Scheduler)
        worksheet.columns = [
            { header: 'ID', key: 'ID', width: 8 },
            { header: 'Établissement', key: 'Établissement', width: 35 },
            { header: 'Ville', key: 'Ville', width: 20 },
            { header: 'Capacité d\'accueil', key: 'Capacité', width: 18 },
            { header: 'Détenus Actuels', key: 'Détenus', width: 18 },
            { header: 'Taux d\'Occupation', key: 'Taux', width: 18 },
            { header: 'Alerte Critique', key: 'Alerte', width: 15 },
        ];
        // 2. Design de l'En-tête (Style Ministère)
        const headerRow = worksheet.getRow(1);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1A5A96' } // Bleu institutionnel
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            };
        });
        // 3. Insertion des données et formatage conditionnel
        data.forEach((item) => {
            const row = worksheet.addRow(item);
            row.alignment = { vertical: 'middle', horizontal: 'center' };
            // Alerte visuelle si le taux dépasse 100% ou si Alerte === "OUI"
            if (item.Alerte === "OUI" || parseInt(item.Taux) > 100) {
                row.getCell('Taux').font = { color: { argb: 'FFFF0000' }, bold: true };
                row.getCell('Alerte').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' } // Fond rouge clair
                };
                row.getCell('Alerte').font = { color: { argb: 'FF9C0006' }, bold: true };
            }
            // Ajout de bordures légères sur chaque cellule de données
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFDEDEDE' } },
                    bottom: { style: 'thin', color: { argb: 'FFDEDEDE' } },
                    left: { style: 'thin', color: { argb: 'FFDEDEDE' } },
                    right: { style: 'thin', color: { argb: 'FFDEDEDE' } }
                };
            });
        });
        // 4. ✅ RÉSOLUTION DU CONFLIT DE TYPE : Conversion explicite en Buffer Node.js
        const arrayBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(arrayBuffer);
    }
}
exports.ExportService = ExportService;
