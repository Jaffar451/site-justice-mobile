"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyAdminOrPolice = exports.onlyJusticeAgents = exports.onlyLawyer = exports.onlyClerk = exports.onlyJudge = exports.onlyProsecutor = exports.onlyPolice = exports.onlyCitizen = exports.onlyAdmin = void 0;
exports.requireRole = requireRole;
/**
 * Vérifie si l'utilisateur connecté possède un rôle autorisé
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
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
exports.onlyAdmin = requireRole("admin");
exports.onlyCitizen = requireRole("citizen");
exports.onlyPolice = requireRole("police");
exports.onlyProsecutor = requireRole("prosecutor");
exports.onlyJudge = requireRole("judge");
exports.onlyClerk = requireRole("clerk");
exports.onlyLawyer = requireRole("lawyer");
// Groupe agents judiciaires (rôles opérationnels)
exports.onlyJusticeAgents = requireRole("police", "prosecutor", "judge", "clerk", "lawyer");
// Groupe d'accès étendu : Admin ou Police
exports.onlyAdminOrPolice = requireRole("admin", "police");
