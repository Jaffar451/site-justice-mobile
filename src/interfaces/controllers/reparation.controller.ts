// @ts-nocheck
import { Request, Response } from "express";
import Reparation from "../../models/reparation.model";

export const createReparation = async (req: Request, res: Response) => {
  try {
    const record = await Reparation.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getReparations = async (_: Request, res: Response) => {
  const records = await Reparation.findAll();
  res.json(records);
};
