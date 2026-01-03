import { Router } from "express";
import { createSearchWarrant, getSearchWarrants } from "../controllers/searchWarrant.controller";

const router = Router();

router.post("/", createSearchWarrant);
router.get("/", getSearchWarrants);

export default router;
