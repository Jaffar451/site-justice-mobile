// PATH: src/config/database.ts

// 👇 On importe l'instance qui contient déjà tous les modèles chargés (User, Complaint, etc.)
import { sequelize } from "../models";

// 👇 On la ré-exporte pour que src/server.ts et src/app.ts puissent l'utiliser sans casser les imports
export { sequelize };

// 👇 Fonction de compatibilité (Au cas où d'anciens fichiers l'importeraient encore)
export const syncDatabase = async () => {
  console.warn(
    "⚠️ ATTENTION : La synchronisation via 'syncDatabase' est dépréciée.",
  );
  console.warn(
    "👉 La gestion se fait désormais dans 'src/server.ts' via sequelize.sync()",
  );
  return sequelize;
};
