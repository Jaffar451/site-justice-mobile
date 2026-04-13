import { Request, Response } from "express";
export const registerEntry = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const listInmates = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const releaseDetainee = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const transferDetainee = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
