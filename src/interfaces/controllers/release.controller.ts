import { Request, Response } from "express";
import Release from "../../models/release.model";

export const createRelease = async (req: Request, res: Response) => {
  try {
    const record = await Release.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getReleases = async (_: Request, res: Response) => {
  const records = await Release.findAll();
  res.json(records);
};
