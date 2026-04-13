import { Request, Response } from "express";
export const createRelease = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getReleases = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
