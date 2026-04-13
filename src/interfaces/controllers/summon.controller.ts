import { Request, Response } from "express";
export const createSummon = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const listSummons = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getSummonsByComplaint = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const updateSummonStatus = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
