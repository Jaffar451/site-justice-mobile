import { Request, Response } from "express";
export const listAssignments = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const createAssignment = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getAssignment = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateAssignment = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteAssignment = async (_: Request, res: Response) =>
  res.json({ success: true });
