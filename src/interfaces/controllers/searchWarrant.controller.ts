// @ts-nocheck
import { Request, Response } from "express";
import SearchWarrant from "../../models/searchWarrant.model";

export const createSearchWarrant = async (req: Request, res: Response) => {
  try {
    const warrant = await SearchWarrant.create(req.body);
    res.status(201).json(warrant);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getSearchWarrants = async (_: Request, res: Response) => {
  const warrants = await SearchWarrant.findAll();
  res.json(warrants);
};
