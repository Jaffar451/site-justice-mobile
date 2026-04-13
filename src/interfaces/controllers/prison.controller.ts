import { Request, Response } from "express";
export const listPrisons = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getPrison = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const createPrison = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updatePrison = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
