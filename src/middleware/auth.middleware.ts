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
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] ❌ Header Authorization manquant ou invalide");
      return res
        .status(401)
        .json({ success: false, message: "Format de token invalide" });
    }

    const token = authHeader.split(" ")[1];

    const secret = env.jwt.secret;
    if (!secret) {
      console.error("[AUTH] ❌ CRITIQUE : JWT_SECRET manquant dans env");
      return res.status(500).json({ message: "Erreur de configuration JWT" });
    }

    const decoded: any = jwt.verify(token, secret);

    const user: any = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      console.log("[AUTH] ❌ Utilisateur introuvable en base");
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    const rawUser = user.dataValues || user;
    const isActive = rawUser.isActive ?? rawUser.is_active ?? true;

    if (isActive === false) {
      console.warn(`[AUTH] ⛔ Compte désactivé pour ${user.email}`);
      return res.status(403).json({
        success: false,
        message: "Compte désactivé. Veuillez contacter l'administration.",
      });
    }

    req.user = user;
    return next();
  } catch (err: any) {
    console.error("[AUTH] ❌ Erreur validation token:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Session expirée ou invalide" });
  }
};

export const protect = authenticate;

/**
 * 👮 2. Middleware d'autorisation par rôles
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `[AUTH] ⛔ Accès interdit. User: ${userRole}, Requis: ${allowedRoles}`,
      );
      return res.status(403).json({
        success: false,
        message: `Accès interdit. Rôle requis : ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

export const isAdmin = authorize(["admin"]);

/**
 * 👮‍♂️ 3. Middleware pour les Chefs d'Unité (Commissaire, Inspecteur, Admin)
 */
export const isStationChief = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }

  const allowedRoles = ["admin", "commissaire", "inspecteur"];

  if (!allowedRoles.includes(req.user.role)) {
    console.warn(`[AUTH] ⛔ Accès unité refusé. Role: ${req.user.role}`);
    return res.status(403).json({
      success: false,
      message: "Accès réservé aux commandants d'unité",
    });
  }

  next();
};

/**
 * 🔒 4. Vérification propriétaire de la station (pour les commissaires)
 */
export const ownsStationOrAdmin = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }

  const { stationId } = req.params;
  const user = req.user;

  // Admin peut tout voir
  if (user.role === "admin") return next();

  // Commissaire : vérifie que c'est sa station
  if (user.role === "commissaire") {
    if (
      user.policeStationId !==
      parseInt(Array.isArray(stationId) ? stationId[0] : stationId)
    ) {
      console.warn(
        `[AUTH] ⛔ Commissaire ${user.id} tente d'accéder à la station ${stationId} (sa station: ${user.policeStationId})`,
      );
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez consulter que les agents de votre unité",
      });
    }
  }

  next();
};
