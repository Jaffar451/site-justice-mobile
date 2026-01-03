// backend/src/utils/crypto.util.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // ✅ Recommandé pour GCM (au lieu de 16)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; 

export const encrypt = (text: string): string => {
  if (Buffer.from(ENCRYPTION_KEY).length !== 32) {
    throw new Error(`La clé doit faire 32 octets. Actuel: ${Buffer.from(ENCRYPTION_KEY).length}`);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');

  // Format: IV:Tag:Content
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decrypt = (hash: string): string => {
  const parts = hash.split(':');
  if (parts.length !== 3) throw new Error("Format de hash invalide");

  const [ivHex, authTagHex, encryptedText] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};