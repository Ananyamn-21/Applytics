import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended IV size for GCM

// Legacy settings (before migration to AES-256-GCM)
const LEGACY_ALGORITHM = 'aes-256-cbc';
const LEGACY_IV_LENGTH = 16;

function getKey(encryptionKey: string): Buffer {
  if (!encryptionKey || encryptionKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }

  // Use the first 32 characters as the key material
  return Buffer.from(encryptionKey.slice(0, 32), 'utf8');
}

export function encrypt(text: string, encryptionKey: string): string {
  const key = getKey(encryptionKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    encrypted.toString('base64'),
    authTag.toString('base64'),
  ].join(':');
}

export function decrypt(encryptedText: string, encryptionKey: string): string {
  if (!encryptedText) {
    throw new Error('Invalid encrypted payload format');
  }

  const parts = encryptedText.split(':');

  // New format: iv:data:authTag (base64, AES-256-GCM)
  if (parts.length === 3) {
    const [ivB64, dataB64, authTagB64] = parts;
    if (!ivB64 || !dataB64 || !authTagB64) {
      throw new Error('Invalid encrypted payload format');
    }

    const key = getKey(encryptionKey);
    const iv = Buffer.from(ivB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  // Legacy format: iv:data (hex, AES-256-CBC)
  if (parts.length === 2) {
    const [ivHex, dataHex] = parts;
    if (!ivHex || !dataHex) {
      throw new Error('Invalid encrypted payload format');
    }

    const keyLegacy = Buffer.from(encryptionKey, 'hex');
    const ivLegacy = Buffer.from(ivHex, 'hex');
    const encryptedLegacy = Buffer.from(dataHex, 'hex');

    if (ivLegacy.length !== LEGACY_IV_LENGTH) {
      throw new Error('Invalid encrypted payload format');
    }

    const decipher = createDecipheriv(LEGACY_ALGORITHM, keyLegacy, ivLegacy);
    const decrypted = Buffer.concat([
      decipher.update(encryptedLegacy),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  throw new Error('Invalid encrypted payload format');
}
