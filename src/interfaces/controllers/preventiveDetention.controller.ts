import { Request, Response } from "express";
export const createPreventiveDetention = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getAllPreventiveDetentions = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
