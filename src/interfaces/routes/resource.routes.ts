// PATH: src/interfaces/routes/resource.routes.ts
import { Router } from "express";
import * as ResourceController from "../controllers/resource.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// ✅ Routes protégées (il faut être connecté)
router.get("/legal-texts", authenticate, ResourceController.getLegalTexts);
router.get("/lawyers", authenticate, ResourceController.getLawyers);

export default router;