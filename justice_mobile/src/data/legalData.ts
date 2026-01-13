// ==========================================
// 1. LES CATÉGORIES (Filtres)
// ==========================================
export const LEGAL_CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'police', label: 'Police & Contrôles' },
  { id: 'justice', label: 'Justice & Plaintes' },
  { id: 'admin', label: 'Papiers Admin.' },
  { id: 'famille', label: 'Famille & Mariage' },
  { id: 'foncier', label: 'Terrain & Logement' },
  { id: 'travail', label: 'Travail & Emploi' },
];

// ==========================================
// 2. INTERFACE (Type de données)
// ==========================================
export interface LegalArticle {
  id: string;
  category: string;
  title: string;
  summary: string; // Ce qu'on voit dans la liste
  content: string; // Le détail complet (avec sauts de ligne)
  keywords: string; // Mots-clés pour la recherche floue
}

// ==========================================
// 3. LA BASE DE CONNAISSANCES
// ==========================================
export const LEGAL_ARTICLES: LegalArticle[] = [
  
  // --- 👮 POLICE & CONTRÔLES ---
  {
    id: 'p1',
    category: 'police',
    title: "Droits en Garde à Vue",
    summary: "Durée légale, droits du détenu et interdictions.",
    content: `Si vous êtes arrêté par la Police ou la Gendarmerie :

1. DURÉE LÉGALE
La garde à vue ne peut dépasser 48 heures. Elle est renouvelable une seule fois (48h de plus) uniquement sur autorisation écrite du Procureur de la République.

2. VOS DROITS IMMÉDIATS
• Vous avez le droit de garder le silence.
• Vous avez le droit de demander à voir un médecin.
• Vous avez le droit de prévenir un proche (famille ou employeur).
• Vous avez le droit de demander l'assistance d'un avocat dès la première heure.

3. INTERDICTIONS
Tout acte de torture, mauvais traitement ou intimidation pour obtenir des aveux est strictement interdit par la loi et la Constitution du Niger.`,
    keywords: "arrestation, prison, commissariat, gendarmerie, cellule, avocat, silence"
  },
  {
    id: 'p2',
    category: 'police',
    title: "Contrôle d'Identité",
    summary: "Quels papiers présenter lors d'un contrôle ?",
    content: `Lors d'un contrôle de routine ou d'une opération de police :

LES DOCUMENTS VALABLES :
• Carte d'Identité Nationale (CNI)
• Passeport valide
• Carte consulaire (pour les étrangers)
• Permis de conduire (souvent accepté)

ATTENTION :
La police ne peut pas confisquer votre pièce d'identité sauf si elle est fausse ou s'il y a un ordre du procureur. 
Si vous n'avez pas vos papiers, vous pouvez être retenu pour une "vérification d'identité" qui ne doit pas excéder 4 heures.`,
    keywords: "papier, cni, carte, identité, rafle, contrôle, route"
  },

  // --- ⚖️ JUSTICE & PLAINTES ---
  {
    id: 'j1',
    category: 'justice',
    title: "Porter Plainte",
    summary: "La procédure pour déposer une plainte officielle.",
    content: `Si vous êtes victime d'une infraction (vol, agression, escroquerie...), voici comment porter plainte :

OPTION 1 : AU COMMISSARIAT / GENDARMERIE
Rendez-vous dans l'unité la plus proche. L'officier doit enregistrer votre plainte sur un Procès-Verbal (PV). Exigez un récépissé ou le numéro du PV.

OPTION 2 : CHEZ LE PROCUREUR
Vous pouvez écrire une lettre directement au Procureur de la République du Tribunal de Grande Instance.
• Mentionnez vos coordonnées complètes.
• Décrivez les faits (date, heure, lieu).
• Joignez les preuves (photos, certificats médicaux).

Une plainte est toujours GRATUITE.`,
    keywords: "vol, agression, victime, tribunal, procureur, pv"
  },
  {
    id: 'j2',
    category: 'justice',
    title: "Casier Judiciaire (B3)",
    summary: "Obtenir son bulletin n°3 pour un concours ou emploi.",
    content: `Le Casier Judiciaire est délivré par le Greffe du Tribunal de Grande Instance.

OÙ FAIRE LA DEMANDE ?
Au tribunal de votre lieu de résidence (grâce à l'interconnexion) ou de votre lieu de naissance.

PIÈCES À FOURNIR :
• Une copie d'acte de naissance.
• Un timbre fiscal de 500 FCFA (ou selon tarif en vigueur).

DÉLAI :
Généralement délivré sous 24h ou 48h jours ouvrables.`,
    keywords: "casier, bulletin, b3, concours, travail, greffier"
  },

  // --- 🏛️ ADMINISTRATIF ---
  {
    id: 'a1',
    category: 'admin',
    title: "Certificat de Nationalité",
    summary: "Preuve de la nationalité nigérienne.",
    content: `Le Certificat de Nationalité est délivré par le Président du Tribunal.

DOSSIER À FOURNIR :
1. Demande timbrée adressée au Président du Tribunal.
2. Copie de votre acte de naissance.
3. Copie du certificat de nationalité d'un des parents (Père ou Mère).
4. Photocopie de la pièce d'identité du parent.
5. Deux témoins munis de leurs pièces d'identité.

Ce document est indispensable pour établir un Passeport ou une Carte d'Identité.`,
    keywords: "nationalité, nigerien, tribunal, passeport, identité"
  },
  {
    id: 'a2',
    category: 'admin',
    title: "Déclaration de Perte",
    summary: "Que faire si on perd ses papiers ?",
    content: `En cas de perte ou de vol de documents (CNI, Permis, Carte grise...) :

1. Rendez-vous immédiatement au Commissariat de Police le plus proche.
2. Faites une déclaration de perte (c'est payant, souvent autour de 1000-2000 FCFA selon le timbre).
3. On vous remettra un "Certificat de Perte".

Ce document vous permet de circuler provisoirement et surtout de refaire vos papiers officiels.`,
    keywords: "perte, vol, papier, déclaration, commissariat"
  },

  // --- 👨‍👩‍👧‍👦 FAMILLE ---
  {
    id: 'f1',
    category: 'famille',
    title: "Déclaration de Naissance",
    summary: "Délais obligatoires pour déclarer un nouveau-né.",
    content: `Toute naissance doit être déclarée à l'État Civil (Mairie ou Préfecture).

DÉLAIS :
• 30 jours pour les zones urbaines.
• 60 jours pour les zones rurales.

PIÈCES :
• Certificat d'accouchement délivré par la maternité.
• Pièces d'identité des parents.

IMPORTANT :
Passé ce délai, vous devrez aller au Tribunal pour obtenir un "Jugement Supplétif", ce qui est une procédure plus longue et coûteuse.`,
    keywords: "bébé, naissance, mairie, acte, jugement, supplétif"
  },
  {
    id: 'f2',
    category: 'famille',
    title: "Procédure de Divorce",
    summary: "Les étapes clés d'une procédure de divorce.",
    content: `Le divorce ne peut être prononcé que par un Juge.

LES ÉTAPES CLÉS :
1. La requête : L'un des époux saisit le tribunal par une lettre.
2. La conciliation : Le juge convoque les époux pour tenter de les réconcilier. C'est obligatoire.
3. Le jugement : Si la conciliation échoue, le juge prononce le divorce et statue sur :
   • La garde des enfants.
   • La pension alimentaire.
   • Le partage des biens.

Le divorce coutumier ou religieux doit être homologué par le tribunal pour avoir une valeur légale officielle.`,
    keywords: "mariage, séparation, garde, enfant, pension, femme, mari"
  },

  // --- 🏠 FONCIER & IMMOBILIER ---
  {
    id: 'fo1',
    category: 'foncier',
    title: "Achat de Terrain",
    summary: "Comment sécuriser l'achat d'une parcelle.",
    content: `ATTENTION AUX ARNAQUES ! N'achetez jamais un terrain avec un simple "petit papier".

PROCÉDURE SÉCURISÉE :
1. Vérification : Allez à la Mairie ou au service des Domaines pour vérifier que le terrain appartient bien au vendeur et n'est pas litigieux.
2. Acte de Vente : La vente doit être constatée par un acte, idéalement notarié, ou authentifié par la Mairie/Commune.
3. Bornage : Exigez un bornage contradictoire (poser les bornes).
4. Mutation : Faites changer le nom sur le Titre Foncier (TF) le plus vite possible.`,
    keywords: "terrain, maison, parcelle, notaire, vente, mairie, arnaque"
  },

  // --- 💼 TRAVAIL ---
  {
    id: 'tr1',
    category: 'travail',
    title: "Licenciement Abusif",
    summary: "Vos droits en cas de renvoi injustifié.",
    content: `Si votre employeur vous renvoie sans motif valable ou sans respecter la procédure :

1. Saisine de l'Inspection du Travail : C'est la première étape obligatoire. L'inspecteur tentera une conciliation.
2. Tribunal du Travail : Si la conciliation échoue, vous pouvez saisir le tribunal.

INDEMNITÉS :
Vous pouvez réclamer :
• Indemnité de préavis.
• Indemnité de licenciement.
• Dommages et intérêts pour licenciement abusif.`,
    keywords: "boulot, patron, salaire, renvoi, chômage, inspection"
  }
];