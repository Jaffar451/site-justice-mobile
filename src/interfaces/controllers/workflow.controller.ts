import { Request, Response } from "express";
export const prosecute = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const dismiss = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const handleFlagrantDelict = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
