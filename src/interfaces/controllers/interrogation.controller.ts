import { Request, Response } from "express";
export const createInterrogation = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getAllInterrogations = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getInterrogation = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateInterrogation = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteInterrogation = async (_: Request, res: Response) =>
  res.json({ success: true });
