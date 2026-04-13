// src/utils/encryption.util.ts
import crypto from "crypto";

// Algorithme sécurisé : AES-256 en mode GCM
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

// 🚨 CLÉ DE 32 CARACTÈRES
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "votre_cle_de_32_caracteres_min_!!";

// ✅ Créer une KeyObject une fois au démarrage
const keyObject = crypto.createSecretKey(Buffer.from(ENCRYPTION_KEY));

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);

  // ✅ Utiliser keyObject au lieu de Buffer
  const cipher = crypto.createCipheriv(ALGORITHM, keyObject, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decrypt = (hash: string): string => {
  const [ivHex, authTagHex, encryptedText] = hash.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  // ✅ Utiliser keyObject au lieu de Buffer
  const decipher = crypto.createDecipheriv(ALGORITHM, keyObject, iv);

  // ✅ Cast simple pour authTag
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
