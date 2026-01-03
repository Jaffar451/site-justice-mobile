import { Router } from "express";
import { createConfiscation, getConfiscations } from "../controllers/confiscation.controller";

const router = Router();

router.post("/", createConfiscation);
router.get("/", getConfiscations);

export default router;
