"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAssignmentRole = requireAssignmentRole;
const assignment_model_1 = __importDefault(require("../models/assignment.model"));
/**
 * Vérifie si l'utilisateur connecté est assigné à l'affaire
 * avec un rôle spécifique.
 */
function requireAssignmentRole(...assignedRoles) {
    return async (req, res, next) => {
        const user = req.user;
        // Find caseId from params or body
        const caseIdParam = req.params.caseId || req.body.caseId || req.params.id;
        if (!user) {
            return res.status(401).json({ message: "Non authentifié" });
        }
        if (!caseIdParam) {
            return res.status(400).json({ message: "ID de l'affaire manquant dans la requête (params ou body)." });
        }
        const caseId = parseInt(caseIdParam, 10);
        if (isNaN(caseId)) {
            return res.status(400).json({ message: "ID de l'affaire invalide." });
        }
        try {
            const assignment = await assignment_model_1.default.findOne({
                where: {
                    caseId: caseId,
                    userId: user.id,
                },
            });
            if (!assignment) {
                return res.status(403).json({ message: "Accès refusé : vous n'êtes pas assigné à cette affaire." });
            }
            if (!assignedRoles.includes(assignment.role)) {
                return res.status(403).json({
                    message: `Rôle insuffisant. Requis: ${assignedRoles.join(" ou ")}, vous avez: ${assignment.role}.`
                });
            }
            // Pass the assignment to the next middleware/controller
            req.assignment = assignment;
            return next();
        }
        catch (error) {
            return res.status(500).json({ message: "Erreur lors de la vérification des permissions." });
        }
    };
}
