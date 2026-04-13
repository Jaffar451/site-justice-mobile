"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyTechAdmin = exports.onlyOfficialAgents = exports.onlyJusticeSpace = exports.onlyPoliceSpace = exports.onlyLawyer = exports.onlyClerk = exports.onlyJudge = exports.onlyProsecutor = exports.onlyCommissaire = exports.onlyPolice = exports.onlyCitizen = exports.onlyAdmin = void 0;
exports.requireRole = requireRole;
/**
 * 🛡️ Vérifie si l'utilisateur possède un rôle autorisé.
 * Compare le rôle extrait du Token JWT avec la liste fournie.
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Session invalide ou utilisateur non authentifié."
            });
        }
        // ✅ La comparaison est maintenant sensible à la casse et aux underscores (ex: 'officier_police')
        if (!roles.includes(user.role)) {
            console.warn(`[AUTH] ⛔ Accès interdit. User: ${user.role}, Requis: ${roles.join(',')}`);
            return res.status(403).json({
                success: false,
                message: `Droits insuffisants. Espace réservé aux rôles : ${roles.join(', ')}`
            });
        }
        return next();
    };
}
// ==========================================
// 🔐 RACCOURCIS PAR RÔLE UNIQUE (Alignés DB)
// ==========================================
exports.onlyAdmin = requireRole("admin");
exports.onlyCitizen = requireRole("citizen");
exports.onlyPolice = requireRole("officier_police"); // ✅ Corrigé
exports.onlyCommissaire = requireRole("commissaire"); // ✅ Corrigé (2 's')
exports.onlyProsecutor = requireRole("prosecutor");
exports.onlyJudge = requireRole("judge");
exports.onlyClerk = requireRole("greffier"); // ✅ Corrigé
exports.onlyLawyer = requireRole("lawyer");
// ==========================================
// 🏛️ GROUPES PAR ESPACE DE TRAVAIL
// ==========================================
/**
 * 🚓 ESPACE SÉCURITÉ (Police, Commissaires, Inspecteurs)
 */
exports.onlyPoliceSpace = requireRole("admin", "officier_police", "commissaire", "inspecteur");
/**
 * ⚖️ ESPACE JUDICIAIRE (Juges, Procureurs, Greffiers)
 */
exports.onlyJusticeSpace = requireRole("admin", "prosecutor", "judge", "greffier");
/**
 * 🏢 TOUS LES AGENTS DE L'ÉTAT (Accès aux plaintes globales)
 */
exports.onlyOfficialAgents = requireRole("admin", "officier_police", "commissaire", "inspecteur", "prosecutor", "judge", "greffier");
/**
 * 🛠️ ESPACE MAINTENANCE
 */
exports.onlyTechAdmin = requireRole("admin");
