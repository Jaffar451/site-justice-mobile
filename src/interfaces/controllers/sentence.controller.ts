import { Request, Response } from "express";
export const createSentence = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getSentences = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getSentence = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateSentence = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteSentence = async (_: Request, res: Response) =>
  res.json({ success: true });
