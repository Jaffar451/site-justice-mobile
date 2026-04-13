import { Request, Response } from "express";
export const listCourts = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getCourt = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const createCourt = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateCourt = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteCourt = async (_: Request, res: Response) =>
  res.json({ success: true });
