"use strict";
// PATH: src/config/database.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = exports.sequelize = void 0;
// 👇 On importe l'instance qui contient déjà tous les modèles chargés (User, Complaint, etc.)
const models_1 = require("../models");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return models_1.sequelize; } });
// 👇 Fonction de compatibilité (Au cas où d'anciens fichiers l'importeraient encore)
const syncDatabase = async () => {
    console.warn("⚠️ ATTENTION : La synchronisation via 'syncDatabase' est dépréciée.");
    console.warn("👉 La gestion se fait désormais dans 'src/server.ts' via sequelize.sync()");
    return models_1.sequelize;
};
exports.syncDatabase = syncDatabase;
