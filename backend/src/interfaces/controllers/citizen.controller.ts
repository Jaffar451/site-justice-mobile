import { Response } from 'express';
import { CitizenService } from '../../application/services/citizen.service';
import { CustomRequest } from '../../types/express-request';

const citizenService = new CitizenService();

export class CitizenController {
  
  async getDashboard(req: CustomRequest, res: Response) {
    try {
      const citizenId = (req.user as any).id;
      const cases = await citizenService.getMyCases(citizenId);
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de vos dossiers" });
    }
  }

  async getNotifications(req: CustomRequest, res: Response) {
    try {
      const userId = (req.user as any).id;
      const notifications = await citizenService.getMyNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des notifications" });
    }
  }
}