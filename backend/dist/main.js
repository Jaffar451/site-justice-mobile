"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
const env_1 = require("./config/env");
require("./models"); // 🔥 important : charge toutes les associations
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const PORT = env_1.env.PORT || 4000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test de connexion
        yield (0, database_1.testConnection)();
        // Synchronisation des modèles
        if (env_1.env.NODE_ENV === 'development') {
            yield (0, database_1.syncDatabase)(false); // false = alter, true = force (drop tables)
        }
        else {
            // En production, utilisez les migrations au lieu de sync
            console.log('⚠️  Mode production : utilisez les migrations Sequelize');
        }
        // Démarrage du serveur
        app_1.default.listen(PORT, () => {
            console.log('\n================================================');
            console.log(`🚀 Serveur lancé sur le port ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Environnement: ${env_1.env.NODE_ENV}`);
            console.log('================================================\n');
        });
    }
    catch (error) {
        console.error('❌ Erreur au démarrage du serveur:', error);
        process.exit(1);
    }
}))();
// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🛑 Arrêt du serveur en cours...');
    try {
        yield database_1.sequelize.close();
        console.log('✅ Connexion à la base de données fermée');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur lors de la fermeture:', error);
        process.exit(1);
    }
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🛑 Signal SIGTERM reçu');
    try {
        yield database_1.sequelize.close();
        console.log('✅ Connexion fermée proprement');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur lors de la fermeture:', error);
        process.exit(1);
    }
}));
