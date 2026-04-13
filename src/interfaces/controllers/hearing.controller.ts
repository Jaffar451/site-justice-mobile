import { Request, Response } from "express";
export const listHearings = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const listHearingsByCase = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const createHearing = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getHearing = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateHearing = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteHearing = async (_: Request, res: Response) =>
  res.json({ success: true });
export const getDailyRoll = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
