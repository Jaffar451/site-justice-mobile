// src/interfaces/routes/custody.routes.ts
import { Router } from "express";
import {
  createCustody,
  getAllCustodies,
  getCustody,
  updateCustody,
  deleteCustody,
} from "../controllers/custody.controller";

const router = Router();

router.post("/", createCustody);
router.get("/", getAllCustodies);
router.get("/:id", getCustody);
router.put("/:id", updateCustody);
router.delete("/:id", deleteCustody);

export default router;
