import { Complaint, CaseModel, Incarceration, Detainee, User } from "../../models";
import sequelize from "../../config/database";

export class WorkflowService {
  
  /**
   * 🔑 GÉNÉRATEUR DE RÉFÉRENCE (Format : RP-ANNÉE-ID)
   */
  private generateCaseReference(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000);
    return `RP-${year}-${random}`;
  }

  /**
   * ✅ MÉTHODE : MISE À JOUR DU STATUT (Transitions Simples)
   * Utilisé pour : TRANSMITTED_TO_COMMISSAIRE, VALIDATED_BY_COMMISSAIRE
   */
  async updateStatus(complaintId: number, newStatus: string) {
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) throw new Error("Plainte introuvable dans le registre national.");

    return await complaint.update({ status: newStatus as any });
  }

  /**
   * ⚖️ MÉTHODE : SAISINE DU JUGE D'INSTRUCTION (Parquet -> Instruction)
   * Gère la transition du dossier vers un cabinet d'instruction spécifique.
   */
  async assignToJudge(complaintId: number, judgeId: number) {
    const transaction = await sequelize.transaction();
    try {
      const complaint = await Complaint.findByPk(complaintId, { transaction });
      if (!complaint) throw new Error("Plainte introuvable.");

      // Vérifier la validité du magistrat
      const judge = await User.findOne({ where: { id: judgeId, role: 'judge' }, transaction });
      if (!judge) throw new Error("L'agent sélectionné n'est pas un juge d'instruction habilité.");

      // 1. Mettre à jour le statut de la plainte
      await complaint.update({ status: "UNDER_INSTRUCTION" as any }, { transaction });

      // 2. Mettre à jour ou créer le dossier judiciaire
      let judicialCase = await CaseModel.findOne({ where: { complaintId }, transaction });
      
      if (judicialCase) {
        // Correction TS2769 : Mise à jour conforme aux attributs du modèle
        await judicialCase.update({
          stage: "INSTRUCTION" as any,
          status: "OPEN" as any
        }, { transaction });
      } else {
        // Création si le dossier n'existait pas encore
        judicialCase = await CaseModel.create({
          complaintId: complaint.id,
          courtId: judge.courtId || 1, 
          reference: this.generateCaseReference(),
          type: "criminal" as any,
          status: "OPEN" as any,
          stage: "INSTRUCTION" as any,
          priority: "medium" as any,
          openedAt: new Date()
        }, { transaction });
      }

      await transaction.commit();
      return { judicialCase, judgeName: `${judge.firstname} ${judge.lastname}` };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * ⚖️ MÉTHODE : ENGAGER DES POURSUITES (Création de dossier RP)
   * Le Procureur décide de porter l'affaire devant le tribunal.
   */
  async prosecuteComplaint(
    complaintId: number, 
    courtId: number, 
    priority: "low" | "medium" | "high" = "medium"
  ) {
    const transaction = await sequelize.transaction();
    try {
      const complaint = await Complaint.findByPk(complaintId, { transaction });
      
      if (!complaint) throw new Error("Plainte introuvable");
      
      // Correction TS2367 : Comparaison type-safe pour le statut
      const currentStatus = (complaint.status as string).toUpperCase();
      if (currentStatus === "CLOSED" || currentStatus === "DISMISSED") {
          throw new Error("Cette plainte a déjà fait l'objet d'un classement sans suite.");
      }

      const newCase = await CaseModel.create({
        complaintId: complaint.id,
        courtId: courtId,
        reference: this.generateCaseReference(),
        type: "criminal" as any,
        description: `Poursuites initiées pour : ${complaint.provisionalOffence || 'Infraction à qualifier'}`,
        status: "OPEN" as any,
        priority: priority as any,
        stage: "PROSECUTION" as any,
        openedAt: new Date()
      }, { transaction });

      await complaint.update({ status: "PROCESSED" as any }, { transaction });

      await transaction.commit();
      return newCase;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 📂 MÉTHODE : CLASSEMENT SANS SUITE (Parquet)
   */
  async closeComplaint(complaintId: number) {
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) throw new Error("Plainte introuvable");

    return await complaint.update({ status: "CLOSED" as any });
  }

  /**
   * ⛓️ MÉTHODE : FLAGRANT DÉLIT (Écrou immédiat)
   * Combine la création du dossier RP et le mandat de dépôt préventif.
   */
  async flagrantDelictIncarceration(data: {
    complaintId: number,
    prisonId: number,
    detaineeInfo: any,
    courtId: number
  }) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Création automatique du dossier judiciaire en haute priorité
      const judicialCase = await this.prosecuteComplaint(
        data.complaintId, 
        data.courtId,
        "high"
      );

      // 2. Gestion de l'identité du détenu (Vérification NIU)
      let detainee = await Detainee.findOne({ 
        where: { niu: data.detaineeInfo.niu }, 
        transaction 
      });

      if (!detainee) {
        detainee = await Detainee.create(data.detaineeInfo, { transaction });
      }

      // 3. Création du mandat de dépôt (Incarceration)
      const incarceration = await Incarceration.create({
        detaineeId: detainee.id,
        prisonId: data.prisonId,
        caseId: judicialCase.id,
        entryDate: new Date(),
        status: "preventive" as any,
        observation: "Défèrement immédiat sous mandat de dépôt (Flagrant délit)"
      }, { transaction });

      await transaction.commit();
      return { judicialCase, incarceration };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
} 