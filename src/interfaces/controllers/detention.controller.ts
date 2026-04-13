import { Request, Response } from "express";
export const createDetention = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getAllDetentions = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getDetention = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateDetention = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteDetention = async (_: Request, res: Response) =>
  res.json({ success: true });
