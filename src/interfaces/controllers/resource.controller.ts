import { Request, Response } from "express";
export const getLegalTexts = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getLawyers = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const seedResources = async (_: Request, res: Response) =>
  res.json({ success: true, message: "Seed OK" });
