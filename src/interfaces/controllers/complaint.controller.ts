import { Request, Response } from "express";
export const createComplaint = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const listComplaints = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const getComplaint = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getMyComplaints = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
export const transmitToHierarchy = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const validateToParquet = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const addAttachment = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const updateComplaint = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const transitionComplaint = async (_: Request, res: Response) =>
  res.json({ success: true, data: null });
export const getAvailableTransitions = async (_: Request, res: Response) =>
  res.json({ success: true, data: [] });
