import { Router } from "express";
import { createRelease, getReleases } from "../controllers/release.controller";

const router = Router();

router.post("/", createRelease);
router.get("/", getReleases);

export default router;
