import { Request, Response } from "express";
export const createSosAlert = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getStationAlerts = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
