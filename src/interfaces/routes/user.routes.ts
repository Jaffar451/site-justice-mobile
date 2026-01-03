// PATH: src/interfaces/routes/user.routes.ts
import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate, isAdmin } from "../../middleware/auth.middleware"; 

const router = Router();

// 🟢 PERSONNEL
router.get("/me", authenticate, userController.getMe);
router.patch("/me", authenticate, userController.updateMe); // ✅ Maintenant reconnu

// 🔴 ADMIN
router.get("/", authenticate, isAdmin, userController.listUsers);
router.post("/", authenticate, isAdmin, userController.createUser);

// 🟠 INDIVIDUEL
router.get("/:id", authenticate, isAdmin, userController.getUser); // ✅ Maintenant reconnu
router.patch("/:id", authenticate, isAdmin, userController.updateUser);
router.delete("/:id", authenticate, isAdmin, userController.deleteUser);

export default router;