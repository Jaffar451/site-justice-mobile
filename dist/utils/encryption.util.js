"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
// src/utils/encryption.util.ts
const crypto_1 = __importDefault(require("crypto"));
// Algorithme sécurisé : AES-256 en mode GCM
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
// 🚨 CLÉ DE 32 CARACTÈRES
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "votre_cle_de_32_caracteres_min_!!";
// ✅ Créer une KeyObject une fois au démarrage
const keyObject = crypto_1.default.createSecretKey(Buffer.from(ENCRYPTION_KEY));
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    // ✅ Utiliser keyObject au lieu de Buffer
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, keyObject, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};
exports.encrypt = encrypt;
const decrypt = (hash) => {
    const [ivHex, authTagHex, encryptedText] = hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    // ✅ Utiliser keyObject au lieu de Buffer
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, keyObject, iv);
    // ✅ Cast simple pour authTag
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decrypt = decrypt;
