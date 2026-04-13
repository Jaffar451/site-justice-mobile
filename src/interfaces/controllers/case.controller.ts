import { Request, Response } from "express";

export const listCases = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const listMyCases = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const createCase = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getCase = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateCase = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
