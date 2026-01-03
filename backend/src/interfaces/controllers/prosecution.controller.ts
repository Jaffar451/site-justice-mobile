import { Request, Response } from "express";
import Prosecution from "../../models/prosecution.model";

export const createProsecution = async (req: Request, res: Response) => {
  try {
    const record = await Prosecution.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getProsecutions = async (_: Request, res: Response) => {
  const records = await Prosecution.findAll();
  res.json(records);
};
