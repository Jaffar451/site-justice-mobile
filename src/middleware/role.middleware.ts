// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from "express";

/**
 * Vérifie si l'utilisateur connecté possède un rôle autorisé
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    next();
  return next();
  };
}

// Raccourcis simples
export const onlyAdmin = requireRole("admin");
export const onlyCitizen = requireRole("citizen");
export const onlyPolice = requireRole("police");
export const onlyProsecutor = requireRole("prosecutor");
export const onlyJudge = requireRole("judge");
export const onlyClerk = requireRole("clerk");
export const onlyLawyer = requireRole("lawyer");

// Groupe agents judiciaires (rôles opérationnels)
export const onlyJusticeAgents = requireRole(
  "police",
  "prosecutor",
  "judge",
  "clerk",
  "lawyer"
);

// Groupe d'accès étendu : Admin ou Police
export const onlyAdminOrPolice = requireRole("admin", "police");

