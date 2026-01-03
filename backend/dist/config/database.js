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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.testConnection = testConnection;
exports.syncDatabase = syncDatabase;
exports.closeConnection = closeConnection;
// src/config/database.ts
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
// Configuration de la connexion
exports.sequelize = new sequelize_1.Sequelize(env_1.env.POSTGRES_DB, env_1.env.POSTGRES_USER, env_1.env.POSTGRES_PASSWORD, {
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    dialect: 'postgres',
    logging: env_1.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: env_1.env.NODE_ENV === 'production' ? 10 : 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
});
/**
 * Test de connexion à la base de données
 */
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.sequelize.authenticate();
            console.log('✅ Connexion à PostgreSQL réussie');
            console.log(`   Database: ${env_1.env.POSTGRES_DB}`);
            console.log(`   Host: ${env_1.env.DB_HOST}:${env_1.env.DB_PORT}`);
        }
        catch (error) {
            console.error('❌ Erreur de connexion à la base de données:');
            console.error(error);
            process.exit(1);
        }
    });
}
/**
 * Synchronisation des modèles (UNIQUEMENT en développement)
 */
function syncDatabase() {
    return __awaiter(this, arguments, void 0, function* (force = false) {
        if (env_1.env.NODE_ENV === 'production' && force) {
            throw new Error('⚠️  sync({ force: true }) est INTERDIT en production !');
        }
        try {
            yield exports.sequelize.sync({ force, alter: !force });
            console.log(`✅ Base de données synchronisée ${force ? '(FORCE)' : '(ALTER)'}`);
        }
        catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            throw error;
        }
    });
}
/**
 * Fermeture propre de la connexion
 */
function closeConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.sequelize.close();
            console.log('✅ Connexion à la base de données fermée');
        }
        catch (error) {
            console.error('❌ Erreur lors de la fermeture:', error);
        }
    });
}
exports.default = exports.sequelize;
