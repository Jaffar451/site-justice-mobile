import { Request, Response } from "express";
export class LawyerController {
  async getMyTracking(_: Request, res: Response) {
    return res.json({ success: true, data: [] });
  }
}
