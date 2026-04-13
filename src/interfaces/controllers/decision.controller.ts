import { Request, Response } from "express";
export const listDecisions = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const listDecisionsByCase = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const createDecision = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getDecision = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateDecision = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteDecision = async (_: Request, res: Response) =>
  res.json({ success: true });
export const signDecision = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
