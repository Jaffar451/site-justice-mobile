import { Request, Response } from "express";
export const uploadAttachment = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const listAttachments = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const deleteAttachment = async (_: Request, res: Response) =>
  res.json({ success: true });
