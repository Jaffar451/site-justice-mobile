import { Request, Response } from "express";
import PoliceStation from "../../models/policeStation.model"; 

export class PoliceStationController {
  
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const stations = await PoliceStation.findAll({ 
        order: [['city', 'ASC'], ['name', 'ASC']] 
      });
      return res.status(200).json({ success: true, data: stations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const newStation = await PoliceStation.create(req.body);
      return res.status(201).json({ success: true, data: newStation });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Erreur création." });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const station = await PoliceStation.findByPk(id);
      if (!station) return res.status(404).json({ success: false, message: "Introuvable" });
      
      await station.update(req.body);
      return res.status(200).json({ success: true, data: station });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Erreur mise à jour." });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deleted = await PoliceStation.destroy({ where: { id: req.params.id } });
      return res.status(200).json({ success: !!deleted, message: "Action terminée." });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Erreur suppression." });
    }
  }
}