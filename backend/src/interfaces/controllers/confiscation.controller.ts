import { Request, Response } from "express";
import Confiscation from "../../models/confiscation.model";

export const createConfiscation = async (req: Request, res: Response) => {
  try {
    const record = await Confiscation.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getConfiscations = async (_: Request, res: Response) => {
  const records = await Confiscation.findAll();
  res.json(records);
};
