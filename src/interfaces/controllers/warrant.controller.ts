import { Request, Response } from "express";
export const getAll = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
