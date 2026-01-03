"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// PATH: src/config/env.ts
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Charger le fichier .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function validateEnv() {
    var _a, _b;
    const required = [
        'DB_HOST',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'JWT_SECRET',
        'REFRESH_SECRET'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`❌ Variables d'environnement manquantes: ${missing.join(', ')}\n` +
            `💡 Vérifiez votre fichier .env`);
    }
    // Validation de la longueur des secrets
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        throw new Error('❌ JWT_SECRET doit faire au moins 32 caractères');
    }
    if (process.env.REFRESH_SECRET && process.env.REFRESH_SECRET.length < 32) {
        throw new Error('❌ REFRESH_SECRET doit faire au moins 32 caractères');
    }
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        // 👇 MODIFICATION 1 : Port par défaut aligné sur le frontend (4000)
        PORT: parseInt(process.env.PORT || '4000'),
        DB_HOST: process.env.DB_HOST,
        DB_PORT: parseInt(process.env.DB_PORT || '5432'),
        POSTGRES_DB: process.env.POSTGRES_DB,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        REFRESH_SECRET: process.env.REFRESH_SECRET,
        REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '30d',
        BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10'),
        // 👇 MODIFICATION 2 : Ajout de '*' pour autoriser le mobile en développement
        CORS_ORIGIN: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || ['*', 'http://localhost:19006'],
        MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
        UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
        ALLOWED_FILE_TYPES: ((_b = process.env.ALLOWED_FILE_TYPES) === null || _b === void 0 ? void 0 : _b.split(',')) || [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf'
        ],
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    };
}
exports.env = validateEnv();
// Log de confirmation au démarrage
if (exports.env.NODE_ENV === 'development') {
    console.log('✅ Variables d\'environnement chargées');
    console.log(`📊 Environnement: ${exports.env.NODE_ENV}`);
    console.log(`🔌 Port: ${exports.env.PORT}`);
    console.log(`🗄️  Base de données: ${exports.env.POSTGRES_DB}@${exports.env.DB_HOST}:${exports.env.DB_PORT}`);
    console.log(`🌐 CORS Allowed: ${exports.env.CORS_ORIGIN.join(', ')}`);
}
