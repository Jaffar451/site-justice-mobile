import { Response } from 'express';
import { BailiffService } from '../../application/services/bailiff.service';
import { CustomRequest } from '../../types/express-request';

const bailiffService = new BailiffService();

export class BailiffController {
  /**
   * Récupère les missions en attente pour l'huissier connecté
   */
  async getMyMissions(req: CustomRequest, res: Response) {
    try {
      // req.user est typé via ton CustomRequest
      const bailiffId = (req.user as any).id;
      const missions = await bailiffService.getPendingMissions(bailiffId);
      
      res.json(missions);
    } catch (error) {
      console.error("Erreur getMyMissions:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des missions" });
    }
  }

  /**
   * Valide la signification d'un acte avec preuve GPS
   */
  async validateMission(req: CustomRequest, res: Response) {
    try {
      const bailiffId = (req.user as any).id;
      const { missionId, lat, lng } = req.body;

      if (!missionId || !lat || !lng) {
        return res.status(400).json({ message: "Données GPS ou ID de mission manquants" });
      }

      // On passe l'ID de l'huissier pour vérifier qu'il est bien assigné à cette mission (sécurité)
      await bailiffService.markAsSignified({
        missionId,
        bailiffId,
        lat,
        lng
      });

      res.json({ message: "Signification validée avec succès" });
    } catch (error) {
      console.error("Erreur validateMission:", error);
      res.status(500).json({ message: "Erreur lors de la validation de la mission" });
    }
  }
}