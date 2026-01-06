// PATH: src/interfaces/routes/auth.routes.ts
import { Router } from "express";
// ✅ Import nommé (les accolades sont importantes)
import { register, login, refreshToken, me, createSuperAdmin } from "../controllers/auth.controller";
import { authenticate } from "../../middleware/auth.middleware"; // Si tu as ce middleware

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", authenticate, me);

// ✨ Route Magique Admin
router.get("/create-super-admin", createSuperAdmin);

export default router;