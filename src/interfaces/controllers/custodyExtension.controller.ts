import { Request, Response } from "express";
export const createCustodyExtension = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getCustodyExtensions = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
