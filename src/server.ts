// PATH: src/server.ts
import { createServer } from "http";
import { env } from "./config/env";
import "./models"; // ✅ Charge les modèles et leurs associations
import app from "./app";
import { sequelize } from "./config/database"; 
import { initSocket } from "./config/socket";
import { SchedulerService } from "./application/services/scheduler.service"; 

// --- CONSTANTES ---
const PORT = Number(env.PORT) || 4000;
const NODE_ENV = env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';

// 1. Création du serveur HTTP
const httpServer = createServer(app);

// 2. Initialisation Socket.io
initSocket(httpServer);

/**
 * 🚀 BOOTSTRAP : DÉMARRAGE DU MOTEUR e-JUSTICE
 */
(async () => {
  try {
    console.log(`\n[${new Date().toISOString()}] ⏳ Démarrage du système e-Justice Niger...`);

    // --- 🔗 Étape 1 : Connexion et Synchro Base de Données ---
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // ⚠️ SÉCURITÉ : En prod, on évite souvent 'alter: true' pour éviter la perte de données accidentelle.
    // On l'active ici si nous sommes en DEV ou si une variable explicite l'autorise.
    const syncOptions = { alter: IS_DEV || process.env.DB_SYNC === 'true' };
    
    console.log(`⏳ Synchronisation de la structure de la base (Options: ${JSON.stringify(syncOptions)})...`);
    await sequelize.sync(syncOptions);
    console.log('✅ Base de données synchronisée.');

    // --- ⏰ Étape 2 : Lancement des Tâches Planifiées ---
    SchedulerService.init();
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

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE LORS DU BOOTSTRAP :');
    console.error(error);
    process.exit(1);
  }
})();

/**
 * 🛡️ GESTION DU DÉTACHEMENT (GRACEFUL SHUTDOWN)
 * Permet de finir les requêtes en cours avant de couper.
 */
const gracefulShutdown = async (signal: string) => {
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
        await sequelize.close();
        console.log('✅ Connexion base de données libérée.');
      } catch (dbError) {
        console.error('⚠️ Erreur fermeture DB:', dbError);
      }

      clearTimeout(forceExit); // Annule le timeout forcé si tout s'est bien passé
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture :', error);
    process.exit(1);
  }
};

// Gestion des signaux système
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Gestion des erreurs non capturées (pour éviter le crash silencieux ou imprévu)
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ ALERTE : Rejet de promesse non géré à :', promise, 'raison :', reason);
  // En prod, on pourrait vouloir logger ça dans un fichier ou Sentry
});

process.on('uncaughtException', (error) => {
  console.error('🔥 CRITICAL : Exception non capturée :', error);
  // Application dans un état instable, il vaut mieux redémarrer
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});