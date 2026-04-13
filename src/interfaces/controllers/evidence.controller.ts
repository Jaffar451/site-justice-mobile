import { Request, Response } from "express";
export const listEvidence = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const createEvidence = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getEvidence = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateEvidence = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteEvidence = async (_: Request, res: Response) =>
  res.json({ success: true });
