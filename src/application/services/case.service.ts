// src/application/services/case.service.ts

import { Transaction } from "sequelize";
import { sequelize } from "../../models";
import CaseModel, { CaseStage } from "../../models/case.model";
import Complaint from "../../models/complaint.model";
import User from "../../models/user.model";
import Assignment from "../../models/assignment.model";
import AuditLog from "../../models/auditLog.model";
import { ProceduralService } from "./procedural.service";

// ─── Machine d'états du Case ───────────────────────────────────────────────────

const STAGE_TRANSITIONS: Record<CaseStage, CaseStage[]> = {
  prosecution_review: ["instruction", "trial", "archived"],
  instruction: ["trial", "archived"],
  trial: ["appeal", "execution", "archived"],
  appeal: ["trial", "execution", "archived"],
  execution: ["archived"],
  archived: [],
};

const STAGE_TRANSITION_ROLES: Record<string, string[]> = {
  "prosecution_review→instruction": ["prosecutor"],
  "prosecution_review→trial": ["prosecutor"],
  "prosecution_review→archived": ["prosecutor"],
  "instruction→trial": ["judge_instruction"],
  "instruction→archived": ["judge_instruction"],
  "trial→appeal": ["judge_trial", "greffier"],
  "trial→execution": ["judge_trial"],
  "trial→archived": ["judge_trial"],
  "appeal→trial": ["judge_trial"],
  "appeal→execution": ["judge_trial"],
  "execution→archived": ["greffier"],
};

export class CaseService {
  /**
   * Crée un Case depuis une Complaint figée.
   * Appelé automatiquement par ComplaintService.transition().
   * Instancie aussi les actes procéduraux obligatoires.
   */
  static async createFromComplaint(
    complaint: Complaint,
    actor: User,
    options?: { transaction?: Transaction },
  ): Promise<CaseModel> {
    const t = options?.transaction || (await sequelize.transaction());
    const isExternal = !!options?.transaction;

    try {
      // 1. Générer la référence du dossier
      const reference = await CaseService.generateReference();

      // 2. Créer le Case
      const newCase = await CaseModel.create(
        {
          reference,
          type: "criminal",
          stage: "prosecution_review",
          priority: "medium",
          complaintId: complaint.id,
          openedAt: new Date(),
        },
        { transaction: t },
      );

      // 3. Assigner le procureur automatiquement
      await Assignment.create(
        {
          caseId: newCase.id,
          userId: actor.id,
          role: "prosecutor",
          assignedAt: new Date(),
          isActive: true,
        },
        { transaction: t },
      );

      // 4. Instancier les actes procéduraux
      if (complaint.offenseCategoryId) {
        await ProceduralService.instantiateForCase(
          newCase,
          complaint.offenseCategoryId,
          newCase.type,
          { transaction: t },
        );
      }

      // 5. Audit
      await AuditLog.create(
        {
          userId: actor.id,
          action: "CASE_CREATED",
          entity: "Case",
          entityId: newCase.id,
          details: JSON.stringify({
            reference,
            fromComplaint: complaint.id,
          }),
        },
        { transaction: t },
      );

      if (!isExternal) await t.commit();
      return newCase;
    } catch (error) {
      if (!isExternal) await t.rollback();
      throw error;
    }
  }

  /**
   * Transition de stage d'un dossier.
   */
  static async transition(
    caseId: number,
    newStage: CaseStage,
    actor: User,
    options?: { reason?: string; transaction?: Transaction },
  ): Promise<CaseModel> {
    const t = options?.transaction || (await sequelize.transaction());
    const isExternal = !!options?.transaction;

    try {
      const judicialCase = await CaseModel.findByPk(caseId, { transaction: t });
      if (!judicialCase) throw new Error(`Dossier #${caseId} introuvable`);

      // Vérifier transition légale
      const allowed = STAGE_TRANSITIONS[judicialCase.stage] || [];
      if (!allowed.includes(newStage)) {
        throw new Error(
          `Transition interdite : ${judicialCase.stage} → ${newStage}`,
        );
      }

      // Vérifier rôle via Assignment actif
      const assignment = await Assignment.findOne({
        where: { caseId, userId: actor.id, isActive: true },
        transaction: t,
      });
      if (!assignment)
        throw new Error(`Aucune assignation active pour cet acteur`);

      const key = `${judicialCase.stage}→${newStage}`;
      const allowedRoles = STAGE_TRANSITION_ROLES[key] || [];
      if (!allowedRoles.includes(assignment.role)) {
        throw new Error(`Rôle '${assignment.role}' non autorisé pour ${key}`);
      }

      await judicialCase.update(
        {
          stage: newStage,
          ...(newStage === "archived" ? { closedAt: new Date() } : {}),
        },
        { transaction: t },
      );

      await AuditLog.create(
        {
          userId: actor.id,
          action: "CASE_STAGE_TRANSITION",
          entity: "Case",
          entityId: judicialCase.id,
          details: JSON.stringify({
            from: judicialCase.stage,
            to: newStage,
            reason: options?.reason || null,
          }),
        },
        { transaction: t },
      );

      if (!isExternal) await t.commit();
      return judicialCase;
    } catch (error) {
      if (!isExternal) await t.rollback();
      throw error;
    }
  }

  /**
   * Génère une référence unique : EJ-2026-000001
   */
  private static async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await CaseModel.count();
    const seq = String(count + 1).padStart(6, "0");
    return `EJ-${year}-${seq}`;
  }

  /**
   * Retourne les transitions de stage disponibles pour un acteur.
   */
  static async getAvailableTransitions(
    judicialCase: CaseModel,
    actor: User,
  ): Promise<CaseStage[]> {
    const assignment = await Assignment.findOne({
      where: { caseId: judicialCase.id, userId: actor.id, isActive: true },
    });
    if (!assignment) return [];

    const possible = STAGE_TRANSITIONS[judicialCase.stage] || [];
    return possible.filter((to) => {
      const key = `${judicialCase.stage}→${to}`;
      return (STAGE_TRANSITION_ROLES[key] || []).includes(assignment.role);
    });
  }
}
