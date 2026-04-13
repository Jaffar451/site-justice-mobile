import { Request, Response } from "express";
export const createConfiscation = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getConfiscations = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
