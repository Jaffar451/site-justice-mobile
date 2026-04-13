import { Request, Response } from "express";
export class CitizenController {
  async getDashboard(_: Request, res: Response) {
    return res.json({ success: true, data: [] });
  }
  async getNotifications(_: Request, res: Response) {
    return res.json({ success: true, data: [] });
  }
}
