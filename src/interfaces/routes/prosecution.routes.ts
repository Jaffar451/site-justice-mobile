import { Router } from "express";
import { createProsecution, getProsecutions } from "../controllers/prosecution.controller";

const router = Router();

router.post("/", createProsecution);
router.get("/", getProsecutions);

export default router;
