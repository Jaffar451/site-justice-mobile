// PATH: src/interfaces/controllers/resource.controller.ts
import { Request, Response } from "express";
import { Lawyer, LegalText } from "../../models"; 

/**
 * 📜 Récupérer les Textes de Loi (PDF)
 */
export const getLegalTexts = async (req: Request, res: Response) => {
  try {
    const texts = await LegalText.findAll({ order: [['title', 'ASC']] });
    
    // On construit l'URL complète pour que le mobile puisse télécharger
    // Ex: https://site-justice-mobile.onrender.com/uploads/docs/code_penal.pdf
    const protocol = req.secure ? 'https' : 'http';
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const formattedData = texts.map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.description, // Ex: "Loi N° 2023..."
      category: t.category,    // Ex: "Lois"
      type: 'pdf',
      // Le lien magique vers le dossier uploads/docs
      link: `${baseUrl}/uploads/docs/${t.filename}` 
    }));

    return res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Erreur getLegalTexts:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * ⚖️ Récupérer l'Annuaire des Avocats
 */
export const getLawyers = async (req: Request, res: Response) => {
  try {
    const lawyers = await Lawyer.findAll({ order: [['lastname', 'ASC']] });
    
    // Formatage pour l'app mobile (CitizenDirectoryScreen)
    const formattedData = lawyers.map(l => ({
      id: `lawyer-${l.id}`,
      title: `Me ${l.firstname} ${l.lastname.toUpperCase()}`,
      subtitle: `${l.specialization} - ${l.city}`,
      category: 'Annuaires',
      icon: 'briefcase-outline',
      type: 'call',
      link: `tel:${l.phone}`
    }));

    return res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Erreur getLawyers:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};