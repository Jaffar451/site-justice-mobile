import { Request, Response } from "express";
export const createWitness = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getWitnesses = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
