"use strict";
// PATH: src/scripts/seed.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 1. On garde l'import de sequelize pour la connexion et sync
const models_1 = require("../models");
// 2. ⚠️ CORRECTION : On importe les Modèles et l'Enum directement depuis leurs fichiers
// Cela évite l'erreur "Module has no exported member"
const user_model_1 = __importStar(require("../models/user.model"));
const policeStation_model_1 = __importDefault(require("../models/policeStation.model"));
const court_model_1 = __importDefault(require("../models/court.model"));
const prison_model_1 = __importDefault(require("../models/prison.model"));
// 3. Librairie de hachage
const bcryptjs_1 = __importDefault(require("bcryptjs")); // Si erreur, remplacez par 'bcrypt'
async function seed() {
    try {
        console.log("🌱 Démarrage du Seeding...");
        // Connexion DB
        await models_1.sequelize.authenticate();
        await models_1.sequelize.sync({ force: true });
        // Hachage du mot de passe
        const passwordHash = await bcryptjs_1.default.hash("password123", 10);
        // --- A. CRÉATION DES STRUCTURES ---
        console.log("🏢 Création des structures...");
        const [tribunal] = await court_model_1.default.findOrCreate({
            where: { name: "Tribunal de Grande Instance de Niamey" },
            defaults: {
                city: "Niamey",
                jurisdiction: "Région de Niamey",
                type: "TGI",
                status: "active"
            }
        });
        const [commissariat] = await policeStation_model_1.default.findOrCreate({
            where: { name: "Commissariat Central de Niamey" },
            defaults: {
                type: "POLICE",
                city: "Niamey",
                district: "Centre-Ville",
                status: "active"
            }
        });
        const [prison] = await prison_model_1.default.findOrCreate({
            where: { name: "Maison d'Arrêt de Niamey" },
            defaults: {
                city: "Niamey",
                type: "Maison d'Arrêt",
                capacity: 1200,
                status: "active"
            }
        });
        // --- B. CRÉATION DES UTILISATEURS ---
        console.log("👤 Création des utilisateurs...");
        // Nettoyage préalable
        await user_model_1.default.destroy({ where: {} });
        // 1. Super Admin
        await user_model_1.default.create({
            firstname: "Super",
            lastname: "Admin",
            email: "admin@justice.ne",
            matricule: "ADM-001",
            password: passwordHash,
            role: user_model_1.UserRole.ADMIN, // ✅ L'erreur a disparu ici
            telephone: "90000000"
        });
        // 2. Procureur
        await user_model_1.default.create({
            firstname: "Amadou",
            lastname: "Procureur",
            email: "procureur@justice.ne",
            matricule: "JUS-001",
            password: passwordHash,
            role: user_model_1.UserRole.PROSECUTOR,
            courtId: tribunal.id,
            telephone: "91000000"
        });
        // 3. Commissaire
        await user_model_1.default.create({
            firstname: "Ibrahim",
            lastname: "Commissaire",
            email: "police@justice.ne",
            matricule: "POL-001",
            password: passwordHash,
            role: user_model_1.UserRole.COMMISSAIRE,
            policeStationId: commissariat.id,
            telephone: "93000000"
        });
        console.log("✅ Seeding terminé avec succès !");
        console.log("👉 Login Admin : admin@justice.ne");
        console.log("👉 Login Police: police@justice.ne");
        console.log("👉 Mot de passe: password123");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Erreur lors du seeding :", error);
        process.exit(1);
    }
}
seed();
