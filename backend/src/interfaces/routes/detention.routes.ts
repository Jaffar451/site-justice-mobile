// src/interfaces/routes/detention.routes.ts
import { Router } from "express";
import {
  createDetention,
  getAllDetentions,
  getDetention,
  updateDetention,
  deleteDetention,
} from "../controllers/detention.controller";

const router = Router();

router.post("/", createDetention);
router.get("/", getAllDetentions);
router.get("/:id", getDetention);
router.put("/:id", updateDetention);
router.delete("/:id", deleteDetention);

export default router;
