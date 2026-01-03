import { Request, Response } from 'express';
import { LawyerService } from '../../application/services/lawyer.service';

const lawyerService = new LawyerService();

export class LawyerController {
  /**
   * Récupère la liste des dossiers suivis par l'avocat (Localisation physique)
   */
  async getMyTracking(req: Request, res: Response) {
    try {
      const lawyerId = (req as any).user.id; 
      const dossiers = await lawyerService.getAcheminementDossiers(lawyerId);
      res.json(dossiers);
    } catch (error) {
      console.error("Erreur getMyTracking:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du suivi" });
    }
  }

  /**
   * Gère le dépôt des conclusions (Upload PDF)
   * Note: req.file est rempli par le middleware 'multer' dans le fichier de routes
   */
  async uploadConclusions(req: Request, res: Response) {
    try {
      const lawyerId = (req as any).user.id;
      const { case_id, title } = req.body;
      const file = req.file; // Le fichier extrait par multer

      if (!file) {
        return res.status(400).json({ message: "Aucun fichier PDF n'a été reçu." });
      }

      if (!case_id) {
        return res.status(400).json({ message: "L'ID du dossier est manquant." });
      }

      // Appel au service pour enregistrer l'entrée dans la base de données
      const attachment = await lawyerService.saveConclusions({
        lawyerId,
        caseId: parseInt(case_id),
        title: title || "Conclusions d'avocat",
        filename: file.filename, // Le nom généré par multer (ex: concl-17000.pdf)
        originalName: file.originalname,
        path: file.path
      });

      return res.status(201).json({
        message: "Les conclusions ont été déposées avec succès.",
        data: attachment
      });

    } catch (error) {
      console.error("Erreur uploadConclusions:", error);
      res.status(500).json({ message: "Erreur lors du dépôt du document." });
    }
  }
}