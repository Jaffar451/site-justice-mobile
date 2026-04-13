import { Request, Response } from "express";
export const createReparation = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getReparations = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
