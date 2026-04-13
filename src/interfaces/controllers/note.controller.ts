import { Request, Response } from "express";
export const listNotes = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const createNote = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getNote = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateNote = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const deleteNote = async (_: Request, res: Response) =>
  res.json({ success: true });
