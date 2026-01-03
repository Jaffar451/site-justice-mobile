// PATH: src/middleware/auth.middleware.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { env } from "../config/env";
import { CustomRequest } from "../types/express-request";

/**
 * 🔐 1. Middleware d'authentification
 */
export const authenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 1. Vérification du Header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] ❌ Header Authorization manquant ou invalide");
      return res.status(401).json({ success: false, message: "Format de token invalide" });
    }

    const token = authHeader.split(" ")[1];
    
    // 2. Vérification du Token
    const secret = env.jwt.secret;
    if (!secret) {
      console.error("[AUTH] ❌ CRITIQUE : JWT_SECRET manquant dans env");
      return res.status(500).json({ message: "Erreur de configuration JWT" });
    }

    const decoded: any = jwt.verify(token, secret);
    // console.log(`[AUTH] 🔓 Token décodé pour ID: ${decoded.id}, Role: ${decoded.role}`);

    // 3. Récupération de l'utilisateur
    const user: any = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      console.log("[AUTH] ❌ Utilisateur introuvable en base");
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    // 4. Vérification du statut Actif
    // ⚠️ CORRECTION : On gère isActive (camelCase) ET is_active (snake_case)
    // On utilise 'user.dataValues' si c'est un objet Sequelize pour être sûr de voir les champs bruts
    const rawUser = user.dataValues || user;
    const isActive = rawUser.isActive ?? rawUser.is_active ?? true; // Par défaut true si le champ n'existe pas

    if (isActive === false) { // On vérifie explicitement false
      console.warn(`[AUTH] ⛔ Compte désactivé pour ${user.email}`);
      return res.status(403).json({ 
        success: false, 
        message: "Compte désactivé. Veuillez contacter l'administration." 
      });
    }

    // Succès : on attache l'user à la requête
    req.user = user;
    return next();

  } catch (err: any) {
    console.error("[AUTH] ❌ Erreur validation token:", err.message);
    return res.status(401).json({ success: false, message: "Session expirée ou invalide" });
  }
};

export const protect = authenticate;

/**
 * 👮 2. Middleware d'autorisation
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const userRole = req.user.role; 

    // console.log(`[AUTH] 👮 Vérification Rôle : Requis [${allowedRoles}] vs Actuel [${userRole}]`);

    if (!allowedRoles.includes(userRole)) {
      console.warn(`[AUTH] ⛔ Accès interdit. User: ${userRole}, Requis: ${allowedRoles}`);
      return res.status(403).json({ 
        success: false,
        message: `Accès interdit. Rôle requis : ${allowedRoles.join(", ")}` 
      });
    }

    next();
  };
};

export const isAdmin = authorize(["admin"]);