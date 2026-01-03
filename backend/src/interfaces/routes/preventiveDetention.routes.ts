import { Router } from "express";
import { createPreventiveDetention, getAllPreventiveDetentions } from "../controllers/preventiveDetention.controller";

const router = Router();

router.post("/", createPreventiveDetention);
router.get("/", getAllPreventiveDetentions);

export default router;
