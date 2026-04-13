import Note from "../../models/note.model"; // ✅ L'import qui manquait
import { logActivity } from "./audit.service";

/**
 * Type local pour sécuriser la visibilité
 */
type NoteVisibility = "internal_prosecution" | "internal_court" | "case_global";

/**
 * Service de création de note avec chiffrement automatique (via le modèle)
 */
export const createNoteService = async (
  req: any,
  data: {
    caseId: number;
    content: string;
    visibility: NoteVisibility;
  },
) => {
  // Le chiffrement et le hachage se font automatiquement dans Note.init (setters)
  const newNote = await Note.create({
    caseId: data.caseId,
    content: data.content,
    visibility: data.visibility,
    userId: req.user.id, // ✅ Utilisation de userId comme défini dans votre modèle
  });

  // 📝 Audit log pour la traçabilité
  await logActivity(req, "CREATE_NOTE", "Note", newNote.id, "info");

  return newNote;
};

/**
 * Récupérer les notes d'un dossier
 */
export const getNotesByCaseService = async (caseId: number) => {
  return await Note.findAll({
    where: { caseId },
    include: ["author"], // Permet de récupérer les infos de l'utilisateur (via l'alias défini)
    order: [["createdAt", "DESC"]],
  });
};
