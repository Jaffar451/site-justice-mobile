import { Request, Response } from "express";
export const createArrestWarrant = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getArrestWarrants = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
