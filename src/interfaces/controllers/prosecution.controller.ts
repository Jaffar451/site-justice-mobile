import { Request, Response } from "express";
export const createProsecution = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getProsecutions = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
