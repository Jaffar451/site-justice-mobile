import { Request, Response } from "express";
export const createAppeal = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getAppeals = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
