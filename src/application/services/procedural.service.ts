// src/application/services/procedural.service.ts

import { Transaction, Op } from "sequelize";
import { addDays } from "date-fns";
import CaseModel from "../../models/case.model";
import ProceduralTemplate from "../../models/proceduralTemplate.model";
import ProceduralStep from "../../models/proceduralStep.model";
import CaseProceduralAct from "../../models/caseProceduralAct.model";
import User from "../../models/user.model";

export class ProceduralService {
  /**
   * Instancie les actes procéduraux obligatoires pour un dossier.
   * Appelé à la création du Case.
   */
  static async instantiateForCase(
    judicialCase: CaseModel,
    offenseCategoryId: number,
    caseType: string,
    options?: { transaction?: Transaction },
  ): Promise<CaseProceduralAct[]> {
    // Trouver le template correspondant
    const template = await ProceduralTemplate.findOne({
      where: { offenseCategoryId, caseType, isActive: true },
      include: [{ model: ProceduralStep, as: "steps" }],
      transaction: options?.transaction,
    });

    if (!template) return []; // Pas de template = pas d'actes obligatoires

    const steps = await ProceduralStep.findAll({
      where: { templateId: template.id, isActive: true },
      order: [["order", "ASC"]],
      transaction: options?.transaction,
    });

    const acts: CaseProceduralAct[] = [];
    for (const step of steps) {
      const act = await CaseProceduralAct.create(
        {
          caseId: judicialCase.id,
          stepId: step.id,
          status: "pending",
          dueAt: addDays(judicialCase.openedAt, step.deadlineDays),
          isLate: false,
        },
        { transaction: options?.transaction },
      );
      acts.push(act);
    }

    return acts;
  }

  /**
   * Marque un acte procédural comme accompli.
   */
  static async completeAct(
    actId: number,
    actor: User,
    options?: { notes?: string; transaction?: Transaction },
  ): Promise<CaseProceduralAct> {
    const act = await CaseProceduralAct.findByPk(actId, {
      include: [{ model: ProceduralStep, as: "step" }],
      transaction: options?.transaction,
    });

    if (!act) throw new Error(`Acte #${actId} introuvable`);
    if (act.status === "done") throw new Error(`Acte déjà accompli`);

    const now = new Date();
    const isLate = now > act.dueAt;

    await act.update(
      {
        status: "done",
        doneAt: now,
        doneById: actor.id,
        isLate,
        notes: options?.notes,
      },
      { transaction: options?.transaction },
    );

    return act;
  }

  /**
   * Retourne le tableau de bord procédural d'un dossier.
   * Utilisé par l'interface pour afficher l'état des actes.
   */
  static async getDashboard(caseId: number): Promise<{
    total: number;
    done: number;
    pending: number;
    overdue: number;
    acts: CaseProceduralAct[];
  }> {
    const acts = await CaseProceduralAct.findAll({
      where: { caseId },
      include: [{ model: ProceduralStep, as: "step" }],
      order: [["due_at", "ASC"]],
    });

    // Mettre à jour les actes en retard
    const now = new Date();
    for (const act of acts) {
      if (act.status === "pending" && now > act.dueAt) {
        await act.update({ status: "overdue", isLate: true });
      }
    }

    return {
      total: acts.length,
      done: acts.filter((a) => a.status === "done").length,
      pending: acts.filter((a) => a.status === "pending").length,
      overdue: acts.filter((a) => a.status === "overdue").length,
      acts,
    };
  }

  /**
   * Retourne tous les actes en retard — pour le scheduler CRON.
   */
  static async getOverdueActs(): Promise<CaseProceduralAct[]> {
    return CaseProceduralAct.findAll({
      where: {
        status: "pending",
        dueAt: { [Op.lt]: new Date() },
      },
      include: [
        { model: ProceduralStep, as: "step" },
        { model: CaseModel, as: "case" },
      ],
    });
  }
}
