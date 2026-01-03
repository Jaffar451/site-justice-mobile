import { Router } from "express";
import { createAppeal, getAppeals } from "../controllers/appeal.controller";

const router = Router();

router.post("/", createAppeal);
router.get("/", getAppeals);

export default router;
