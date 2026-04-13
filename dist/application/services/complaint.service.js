"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintService = exports.WrongInstitutionError = exports.UnauthorizedTransitionError = exports.InvalidTransitionError = exports.ComplaintNotFoundError = void 0;
const models_1 = require("../../models");
const complaint_model_1 = __importDefault(require("../../models/complaint.model"));
const user_model_1 = require("../../models/user.model");
const case_service_1 = require("./case.service");
const auditLog_model_1 = __importDefault(require("../../models/auditLog.model"));
// ======================================================
// 🧠 WORKFLOW STABLE (VERSION PRODUCTION)
// ======================================================
const TRANSITIONS = {
    soumise: ["en_cours_OPJ"],
    en_cours_OPJ: [
        "attente_validation",
        "classée_sans_suite_par_OPJ",
    ],
    attente_validation: [
        "transmise_parquet",
        "classée_sans_suite_par_OPJ",
    ],
    transmise_parquet: [
        "figée",
        "classée_sans_suite_par_procureur",
    ],
    figée: [],
    classée_sans_suite_par_OPJ: [],
    classée_sans_suite_par_procureur: [],
};
// ======================================================
// 🔐 RÔLES AUTORISÉS
// ======================================================
const TRANSITION_ROLES = {
    "soumise→en_cours_OPJ": [
        user_model_1.UserRole.OPJ_GENDARME,
        user_model_1.UserRole.INSPECTEUR,
        user_model_1.UserRole.OFFICIER_POLICE,
    ],
    "en_cours_OPJ→attente_validation": [
        user_model_1.UserRole.OPJ_GENDARME,
        user_model_1.UserRole.INSPECTEUR,
        user_model_1.UserRole.OFFICIER_POLICE,
    ],
    "en_cours_OPJ→classée_sans_suite_par_OPJ": [
        user_model_1.UserRole.OPJ_GENDARME,
        user_model_1.UserRole.INSPECTEUR,
        user_model_1.UserRole.OFFICIER_POLICE,
    ],
    "attente_validation→transmise_parquet": [
        user_model_1.UserRole.COMMISSAIRE,
    ],
    "attente_validation→classée_sans_suite_par_OPJ": [
        user_model_1.UserRole.COMMISSAIRE,
    ],
    "transmise_parquet→figée": [
        user_model_1.UserRole.PROSECUTOR,
    ],
    "transmise_parquet→classée_sans_suite_par_procureur": [
        user_model_1.UserRole.PROSECUTOR,
    ],
};
// ======================================================
// ❌ ERREURS
// ======================================================
class ComplaintNotFoundError extends Error {
}
exports.ComplaintNotFoundError = ComplaintNotFoundError;
class InvalidTransitionError extends Error {
}
exports.InvalidTransitionError = InvalidTransitionError;
class UnauthorizedTransitionError extends Error {
}
exports.UnauthorizedTransitionError = UnauthorizedTransitionError;
class WrongInstitutionError extends Error {
}
exports.WrongInstitutionError = WrongInstitutionError;
// ======================================================
// ⚙️ SERVICE
// ======================================================
class ComplaintService {
    static async transition(complaintId, newStatus, actor, options) {
        const t = options?.transaction || await models_1.sequelize.transaction();
        const external = !!options?.transaction;
        try {
            const complaint = await complaint_model_1.default.findByPk(complaintId, { transaction: t });
            if (!complaint)
                throw new ComplaintNotFoundError();
            // 1. validation transition
            const allowed = TRANSITIONS[complaint.status] || [];
            if (!allowed.includes(newStatus)) {
                throw new InvalidTransitionError(`${complaint.status} → ${newStatus}`);
            }
            // 2. validation rôle
            const key = `${complaint.status}→${newStatus}`;
            const roles = TRANSITION_ROLES[key] || [];
            if (!roles.includes(actor.role)) {
                throw new UnauthorizedTransitionError(`Rôle ${actor.role} non autorisé pour ${key}`);
            }
            // 3. institution
            await this.checkInstitution(complaint, actor);
            const previousStatus = complaint.status;
            // 4. update
            await complaint.update({ status: newStatus }, { transaction: t });
            // 5. audit
            await auditLog_model_1.default.create({
                userId: actor.id,
                action: "COMPLAINT_TRANSITION",
                entity: "Complaint",
                entityId: complaint.id,
                details: JSON.stringify({
                    from: previousStatus,
                    to: newStatus,
                    reason: options?.reason || null,
                }),
            }, { transaction: t });
            // 6. case auto
            let caseEntity;
            if (newStatus === "figée") {
                caseEntity = await case_service_1.CaseService.createFromComplaint(complaint, actor, { transaction: t });
            }
            if (!external)
                await t.commit();
            return { complaint, case: caseEntity };
        }
        catch (err) {
            if (!external)
                await t.rollback();
            throw err;
        }
    }
    // ======================================================
    // 🏛️ INSTITUTION
    // ======================================================
    static async checkInstitution(complaint, actor) {
        const restricted = [
            user_model_1.UserRole.OPJ_GENDARME,
            user_model_1.UserRole.INSPECTEUR,
            user_model_1.UserRole.OFFICIER_POLICE,
            user_model_1.UserRole.COMMISSAIRE,
        ];
        if (restricted.includes(actor.role)) {
            if (complaint.policeStationId &&
                actor.policeStationId !== complaint.policeStationId) {
                throw new WrongInstitutionError();
            }
        }
    }
    // ======================================================
    // 📊 TRANSITIONS DISPONIBLES
    // ======================================================
    static getAvailableTransitions(complaint, actor) {
        const possible = TRANSITIONS[complaint.status] || [];
        return possible.filter((to) => {
            const key = `${complaint.status}→${to}`;
            const roles = TRANSITION_ROLES[key] || [];
            return roles.includes(actor.role);
        });
    }
}
exports.ComplaintService = ComplaintService;
