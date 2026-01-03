import { Router } from "express";
import { createReparation, getReparations } from "../controllers/reparation.controller";

const router = Router();

router.post("/", createReparation);
router.get("/", getReparations);

export default router;
