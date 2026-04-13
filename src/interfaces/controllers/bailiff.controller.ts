import { Request, Response } from "express";
export class BailiffController {
  async getMyMissions(_: Request, res: Response) {
    return res.json({ success: true, data: [] });
  }
  async validateMission(_: Request, res: Response) {
    return res.json({ success: true, data: null });
  }
}
