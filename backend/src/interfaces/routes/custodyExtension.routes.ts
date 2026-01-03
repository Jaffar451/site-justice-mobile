import { Router } from "express";
import { createCustodyExtension, getCustodyExtensions } from "../controllers/custodyExtension.controller";

const router = Router();

router.post("/", createCustodyExtension);
router.get("/", getCustodyExtensions);

export default router;
