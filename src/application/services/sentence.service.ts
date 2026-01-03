import { Sentence, Incarceration, Detainee } from "../../models";
import {sequelize} from "../../config/database";

export class SentenceService {
  
  /**
   * ⛓️ APPLIQUER LA PEINE AU DÉTENU
   * Transforme le statut "Préventif" en "Condamné" et calcule la sortie.
   */
  async executeSentence(sentenceId: number) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Récupérer la sentence avec les détails
      const sentence = await Sentence.findByPk(sentenceId, { transaction });
      if (!sentence) throw new Error("Peine introuvable");

      // 2. Trouver l'incarcération active pour cette affaire
      const incarceration = await Incarceration.findOne({
        where: { caseId: sentence.caseId, status: "preventive" },
        transaction
      });

      if (incarceration) {
        // 3. Calcul de la date de libération prévue (DLP)
        // On part de la date d'entrée en prison (la préventive compte)
        const releaseDate = new Date(incarceration.entryDate);
        
        releaseDate.setFullYear(releaseDate.getFullYear() + (sentence.firmYears || 0));
        releaseDate.setMonth(releaseDate.getMonth() + (sentence.firmMonths || 0));
        releaseDate.setDate(releaseDate.getDate() + (sentence.firmDays || 0));

        // 4. Mise à jour de l'écrou
        await incarceration.update({
          status: "convicted", // Devient condamné
          releaseDate: releaseDate,
          observation: `Condamnation ferme suite à décision n°${sentence.decisionId}`
        }, { transaction });
      }

      await transaction.commit();
      return incarceration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}