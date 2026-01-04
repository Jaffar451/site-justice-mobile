// @ts-nocheck
import { Request, Response } from "express";
import CustodyExtension from "../../models/custodyExtension.model";

export const createCustodyExtension = async (req: Request, res: Response) => {
  try {
    const record = await CustodyExtension.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getCustodyExtensions = async (_: Request, res: Response) => {
  const records = await CustodyExtension.findAll();
  res.json(records);
};
