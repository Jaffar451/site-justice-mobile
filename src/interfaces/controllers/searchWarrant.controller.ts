import { Request, Response } from "express";
export const createSearchWarrant = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getSearchWarrants = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
