// PATH: src/interfaces/controllers/resource.controller.ts
import { Request, Response } from "express";
import { Lawyer, LegalText } from "../../models";
// 👇 CORRECTION ICI : 'env' en minuscules
import { env } from "../../config/env"; 

/**
 * 📜 Récupérer les Textes de Loi
 */
export const getLegalTexts = async (req: Request, res: Response) => {
  try {
    const texts = await LegalText.findAll({ order: [['title', 'ASC']] });
    
    // Construction dynamique de l'URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const data = texts.map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.description,
      category: t.category,
      type: 'pdf',
      // Lien vers le fichier uploadé
      link: `${baseUrl}/uploads/docs/${t.filename}` 
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur getLegalTexts:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * ⚖️ Récupérer les Avocats
 */
export const getLawyers = async (req: Request, res: Response) => {
  try {
    const lawyers = await Lawyer.findAll({ order: [['lastname', 'ASC']] });
    
    // On transforme les données pour qu'elles soient prêtes à l'affichage mobile
    const data = lawyers.map(l => ({
      id: `lawyer-${l.id}`,
      title: `Me ${l.firstname} ${l.lastname.toUpperCase()}`,
      subtitle: `${l.specialization} - ${l.city}`,
      category: 'Annuaires',
      icon: 'briefcase-outline',
      type: 'call',
      link: `tel:${l.phone}`
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur getLawyers:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * ✨ MAGIC SEED : Fonction pour remplir la base à distance
 */
export const seedResources = async (req: Request, res: Response) => {
  try {
    console.log("🌱 Démarrage du Seeding Manuel...");

    // 1. LES LOIS
    const laws = [
      {
        title: "Code Pénal",
        description: "Loi N° 2003-025 du 13 juin 2003",
        category: "Lois",
        filename: "code_penal.pdf"
      },
      {
        title: "Code de Procédure Pénale",
        description: "Règles de procédure judiciaire",
        category: "Lois",
        filename: "procedure_penale.pdf"
      },
      {
        title: "Code de la Famille",
        description: "Mariage, Filiation, Héritage",
        category: "Lois",
        filename: "code_famille.pdf"
      }
    ];

    for (const law of laws) {
      // On utilise findOrCreate pour ne pas créer de doublons
      await LegalText.findOrCreate({ where: { title: law.title }, defaults: law });
    }

    // 2. LES AVOCATS
    const lawyers = [
      {
        firstname: "Moussa", lastname: "ADAMOU", specialization: "Droit Pénal",
        city: "Niamey", phone: "+22790000000", email: "moussa@cabinet.ne", address: "Plateau"
      },
      {
        firstname: "Fatou", lastname: "SEYNI", specialization: "Droit de la Famille",
        city: "Zinder", phone: "+22791000000", email: "fatou@cabinet.ne", address: "Centre"
      },
      {
        firstname: "Ibrahim", lastname: "SANI", specialization: "Droit des Affaires",
        city: "Maradi", phone: "+22792000000", email: "ibrahim@cabinet.ne", address: "Marché"
      }
    ];

    for (const lawyer of lawyers) {
      await Lawyer.findOrCreate({ where: { email: lawyer.email }, defaults: lawyer });
    }

    return res.json({ success: true, message: "✅ Base de données Render remplie avec succès !" });

  } catch (error: any) {
    console.error("❌ Erreur Seed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};