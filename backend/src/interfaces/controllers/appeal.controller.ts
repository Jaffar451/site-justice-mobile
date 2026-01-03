import { Request, Response } from "express";
import Appeal from "../../models/appeal.model";

export const createAppeal = async (req: Request, res: Response) => {
  try {
    const record = await Appeal.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAppeals = async (_: Request, res: Response) => {
  const records = await Appeal.findAll();
  res.json(records);
};
