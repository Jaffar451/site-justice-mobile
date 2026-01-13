// src/data/legalData.ts

export const LEGAL_CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'admin', label: 'Administratif' },
  { id: 'civil', label: 'Civil / Famille' },
  { id: 'penal', label: 'Pénal & Droits' },
  { id: 'business', label: 'Affaires' },
];

export const LEGAL_ARTICLES = [
  {
    id: '1',
    category: 'admin',
    title: "Obtenir un Casier Judiciaire",
    summary: "La procédure pour obtenir le bulletin n°3 au Niger.",
    content: "Le casier judiciaire (Bulletin n°3) peut être demandé dans n'importe quel tribunal de grande instance, quel que soit votre lieu de naissance. \n\nPièces à fournir :\n- Une copie d'acte de naissance\n- Un timbre fiscal de 500 FCFA\n\nDélai : Délivrance immédiate ou sous 24h.",
    keywords: "casier, bulletin, crime, papier"
  },
  {
    id: '2',
    category: 'admin',
    title: "Certificat de Nationalité",
    summary: "Comment prouver sa nationalité nigérienne.",
    content: "Le certificat de nationalité est délivré par le Président du Tribunal. Il faut fournir :\n- Acte de naissance\n- Certificat de nationalité du père ou de la mère\n- Deux témoins avec leurs pièces d'identité.",
    keywords: "nationalité, identité, tribunal"
  },
  {
    id: '3',
    category: 'penal',
    title: "Droits en Garde à Vue",
    summary: "Vos droits fondamentaux lors d'une arrestation.",
    content: "Si vous êtes arrêté par la police ou la gendarmerie :\n1. Vous avez le droit de garder le silence.\n2. Vous avez le droit de prévenir un proche.\n3. Vous avez le droit d'être examiné par un médecin.\n4. La garde à vue ne peut dépasser 48h (renouvelable une fois sur autorisation du Procureur).",
    keywords: "police, arrêt, prison, avocat, silence"
  },
  {
    id: '4',
    category: 'civil',
    title: "Déclaration de Naissance",
    summary: "Délais et procédures pour déclarer un nouveau-né.",
    content: "Toute naissance doit être déclarée à l'officier d'état civil de la mairie du lieu de naissance dans un délai de 30 ou 60 jours (selon la zone). Passé ce délai, un jugement supplétif au tribunal sera nécessaire.",
    keywords: "bébé, naissance, mairie, jugement"
  },
  {
    id: '5',
    category: 'penal',
    title: "Porter Plainte",
    summary: "La démarche pour déposer une plainte.",
    content: "Vous pouvez porter plainte dans n'importe quel commissariat de police ou brigade de gendarmerie. Vous pouvez également adresser une plainte directement au Procureur de la République par lettre manuscrite.",
    keywords: "plainte, victime, vol, agression"
  },
];