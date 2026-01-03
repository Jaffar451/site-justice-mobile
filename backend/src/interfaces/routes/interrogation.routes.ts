// src/interfaces/routes/interrogation.routes.ts
import { Router } from "express";
import {
  createInterrogation,
  getAllInterrogations,
  getInterrogation,
  updateInterrogation,
  deleteInterrogation,
} from "../controllers/interrogation.controller";

const router = Router();

router.post("/", createInterrogation);
router.get("/", getAllInterrogations);
router.get("/:id", getInterrogation);
router.put("/:id", updateInterrogation);
router.delete("/:id", deleteInterrogation);

export default router;
