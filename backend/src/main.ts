// PATH: src/server.ts
import { createServer } from "http";
import { env } from "./config/env";
import "./models"; // ✅ Charge les modèles
import app from "./app";
import { sequelize } from "./config/database"; 
import { initSocket } from "./config/socket";
import { SchedulerService } from "./application/services/scheduler.service"; 

// ✅ CORRECTION ICI : On force la conversion en Nombre pour éviter l'erreur TypeScript
const PORT = Number(env.PORT) || 4000;

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

    // ⚠️ On utilise alter: true pour les mises à jour futures sans perdre les données
    console.log('⏳ Synchronisation de la structure de la base (Mode Alter)...');
    
    await sequelize.sync({ alter: true }); 
    
    console.log('✅ Base de données synchronisée.');

    // --- ⏰ Étape 2 : Lancement des Tâches Planifiées ---
    SchedulerService.init();
    console.log('✅ Service de planification (CRON) initialisé.');

    // --- 📡 Étape 3 : Ouverture du Serveur ---
    // TypeScript ne râlera plus car PORT est bien un nombre
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log('\n================================================');
      console.log(`⚖️  SIJ NIGER (SYSTEME D'INFORMATION JUDICIAIRE)`);
      console.log(`------------------------------------------------`);
      console.log(`🚀 VERSION   : 2.2.0`);
      console.log(`🌍 ENV       : ${env.NODE_ENV?.toUpperCase() || 'DEV'}`);
      console.log(`📍 PORT      : ${PORT}`);
      console.log(`📡 SOCKET.IO : OPERATIONNEL`);
      console.log(`🗄️  DATABASE  : SYNCHRONISÉE (Mode Alter)`); // Log mis à jour
      console.log('================================================\n');
    });

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE LORS DU BOOTSTRAP :');
    console.error(error);
    process.exit(1);
  }
})();

/**
 * 🛡️ GESTION DU DÉSACHEMENT (GRACEFUL SHUTDOWN)
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Signal ${signal} reçu. Fermeture des services e-Justice...`);
  try {
    httpServer.close(async () => {
      console.log('✅ Serveur HTTP/Socket arrêté.');
      await sequelize.close();
      console.log('✅ Connexion base de données libérée.');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture :', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ ALERTE : Rejet de promesse non géré à :', promise, 'raison :', reason);
});