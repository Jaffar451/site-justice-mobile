import { Router } from "express";
import AuthController from "../controllers/auth.controller"; // ✅ Import de la classe
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Vérif de sécurité pour éviter l'erreur "Undefined"
if (!AuthController.login || !AuthController.register) {
  console.error("❌ ERREUR: Les méthodes du AuthController ne sont pas chargées !");
}

// Routes Publiques
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);

// Routes Protégées
// Note : Assurez-vous que 'authenticate' est bien défini dans vos middlewares
router.get("/me", authenticate, AuthController.me);

export default router;