import Evidence from "../../models/evidence.model";

export class EvidenceService {
  /**
   * 📂 Récupérer toutes les preuves liées à un dossier
   */
  async getEvidenceByCase(caseId: number) {
    // Si caseId est 0, on peut retourner tout (utile pour l'admin)
    const filter = caseId === 0 ? {} : { caseId };
    return await Evidence.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * 🔍 AJOUTÉ : Récupérer une seule preuve par son ID
   * (Corrige l'erreur TypeScript dans le contrôleur)
   */
  async getEvidenceById(id: number) {
    return await Evidence.findByPk(id);
  }

  /**
   * 💾 Ajouter une nouvelle preuve
   */
  async addEvidence(data: {
    caseId: number;
    uploaderId: number;
    description: string;
    type: "document" | "image" | "audio" | "video" | "other";
    fileUrl: string;
    filename: string;
    hash: string;
  }) {
    return await Evidence.create({
      caseId: data.caseId,
      uploaderId: data.uploaderId,
      description: data.description,
      type: data.type,
      fileUrl: data.fileUrl,
      filename: data.filename,
      hash: data.hash,
    });
  }

  /**
   * 📝 AJOUTÉ : Mettre à jour les informations d'une preuve
   * (Corrige l'erreur TypeScript et le crash au démarrage)
   */
  async updateEvidence(id: number, data: Partial<Evidence>) {
    const evidence = await Evidence.findByPk(id);
    if (!evidence) return null;

    return await evidence.update(data);
  }

  /**
   * 🗑️ Supprimer une preuve
   */
  async deleteEvidence(id: number) {
    const evidence = await Evidence.findByPk(id);
    if (!evidence) return null;

    await evidence.destroy();
    return true;
  }
}
