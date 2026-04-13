"use strict";
// src/application/services/procedural.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProceduralService = void 0;
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns");
const case_model_1 = __importDefault(require("../../models/case.model"));
const proceduralTemplate_model_1 = __importDefault(require("../../models/proceduralTemplate.model"));
const proceduralStep_model_1 = __importDefault(require("../../models/proceduralStep.model"));
const caseProceduralAct_model_1 = __importDefault(require("../../models/caseProceduralAct.model"));
class ProceduralService {
    /**
     * Instancie les actes procéduraux obligatoires pour un dossier.
     * Appelé à la création du Case.
     */
    static async instantiateForCase(judicialCase, offenseCategoryId, caseType, options) {
        // Trouver le template correspondant
        const template = await proceduralTemplate_model_1.default.findOne({
            where: { offenseCategoryId, caseType, isActive: true },
            include: [{ model: proceduralStep_model_1.default, as: 'steps' }],
            transaction: options?.transaction,
        });
        if (!template)
            return []; // Pas de template = pas d'actes obligatoires
        const steps = await proceduralStep_model_1.default.findAll({
            where: { templateId: template.id, isActive: true },
            order: [['order', 'ASC']],
            transaction: options?.transaction,
        });
        const acts = [];
        for (const step of steps) {
            const act = await caseProceduralAct_model_1.default.create({
                caseId: judicialCase.id,
                stepId: step.id,
                status: 'pending',
                dueAt: (0, date_fns_1.addDays)(judicialCase.openedAt, step.deadlineDays),
                isLate: false,
            }, { transaction: options?.transaction });
            acts.push(act);
        }
        return acts;
    }
    /**
     * Marque un acte procédural comme accompli.
     */
    static async completeAct(actId, actor, options) {
        const act = await caseProceduralAct_model_1.default.findByPk(actId, {
            include: [{ model: proceduralStep_model_1.default, as: 'step' }],
            transaction: options?.transaction,
        });
        if (!act)
            throw new Error(`Acte #${actId} introuvable`);
        if (act.status === 'done')
            throw new Error(`Acte déjà accompli`);
        const now = new Date();
        const isLate = now > act.dueAt;
        await act.update({
            status: 'done',
            doneAt: now,
            doneById: actor.id,
            isLate,
            notes: options?.notes,
        }, { transaction: options?.transaction });
        return act;
    }
    /**
     * Retourne le tableau de bord procédural d'un dossier.
     * Utilisé par l'interface pour afficher l'état des actes.
     */
    static async getDashboard(caseId) {
        const acts = await caseProceduralAct_model_1.default.findAll({
            where: { caseId },
            include: [{ model: proceduralStep_model_1.default, as: 'step' }],
            order: [['due_at', 'ASC']],
        });
        // Mettre à jour les actes en retard
        const now = new Date();
        for (const act of acts) {
            if (act.status === 'pending' && now > act.dueAt) {
                await act.update({ status: 'overdue', isLate: true });
            }
        }
        return {
            total: acts.length,
            done: acts.filter(a => a.status === 'done').length,
            pending: acts.filter(a => a.status === 'pending').length,
            overdue: acts.filter(a => a.status === 'overdue').length,
            acts,
        };
    }
    /**
     * Retourne tous les actes en retard — pour le scheduler CRON.
     */
    static async getOverdueActs() {
        return caseProceduralAct_model_1.default.findAll({
            where: {
                status: 'pending',
                dueAt: { [sequelize_1.Op.lt]: new Date() },
            },
            include: [
                { model: proceduralStep_model_1.default, as: 'step' },
                { model: case_model_1.default, as: 'case' },
            ],
        });
    }
}
exports.ProceduralService = ProceduralService;
