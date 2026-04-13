"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/server.ts
const http_1 = require("http");
const env_1 = require("./config/env");
require("./models"); // ✅ Charge les modèles et leurs associations
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const socket_1 = require("./config/socket");
const scheduler_service_1 = require("./application/services/scheduler.service");
// --- CONSTANTES ---
const PORT = Number(env_1.env.PORT) || 4000;
const NODE_ENV = env_1.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';
// 1. Création du serveur HTTP
const httpServer = (0, http_1.createServer)(app_1.default);
// 2. Initialisation Socket.io
(0, socket_1.initSocket)(httpServer);
/**
 * 🚀 BOOTSTRAP : DÉMARRAGE DU MOTEUR e-JUSTICE
 */
(async () => {
    try {
        console.log(`\n[${new Date().toISOString()}] ⏳ Démarrage du système e-Justice Niger...`);
        // --- 🔗 Étape 1 : Connexion et Synchro Base de Données ---
        await database_1.sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie avec succès.');
        const syncOptions = { alter: IS_DEV || process.env.DB_SYNC === 'true' };
        console.log(`⏳ Synchronisation de la structure de la base (Options: ${JSON.stringify(syncOptions)})...`);
        await database_1.sequelize.sync(syncOptions);
        console.log('✅ Base de données synchronisée.');
        // --- ⏰ Étape 2 : Lancement des Tâches Planifiées ---
        scheduler_service_1.SchedulerService.init();
        console.log('✅ Service de planification (CRON) initialisé.');
        // --- 📡 Étape 3 : Ouverture du Serveur ---
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log('\n================================================');
            console.log(`⚖️  SIJ NIGER (SYSTEME D'INFORMATION JUDICIAIRE)`);
            console.log(`------------------------------------------------`);
            console.log(`🚀 VERSION   : 2.2.0`);
            console.log(`🌍 ENV       : ${NODE_ENV.toUpperCase()}`);
            console.log(`📍 PORT      : ${PORT}`);
            console.log(`📡 SOCKET.IO : OPERATIONNEL`);
            console.log(`🗄️  DATABASE  : SYNCHRONISÉE`);
            console.log('================================================\n');
        });
    }
    catch (error) {
        console.error('\n❌ ERREUR CRITIQUE LORS DU BOOTSTRAP :');
        console.error(error);
        process.exit(1);
    }
})();
/**
 * 🛡️ GESTION DU DÉTACHEMENT (GRACEFUL SHUTDOWN)
 * Permet de finir les requêtes en cours avant de couper.
 */
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Signal ${signal} reçu. Fermeture des services e-Justice...`);
    // Force la fermeture après 10 secondes si les connexions ne se ferment pas
    const forceExit = setTimeout(() => {
        console.error('⚠️  Fermeture forcée (timeout atteint).');
        process.exit(1);
    }, 10000);
    try {
        // 1. Arrêt du serveur HTTP & Socket
        httpServer.close(async () => {
            console.log('✅ Serveur HTTP/Socket arrêté.');
            // 2. Fermeture Base de données
            try {
                await database_1.sequelize.close();
                console.log('✅ Connexion base de données libérée.');
            }
            catch (dbError) {
                console.error('⚠️ Erreur fermeture DB:', dbError);
            }
            clearTimeout(forceExit);
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Erreur lors de la fermeture :', error);
        process.exit(1);
    }
};
// Gestion des signaux système
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ ALERTE : Rejet de promesse non géré à :', promise, 'raison :', reason);
});
process.on('uncaughtException', (error) => {
    console.error('🔥 CRITICAL : Exception non capturée :', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
