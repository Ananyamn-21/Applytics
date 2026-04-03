"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const LEGACY_ALGORITHM = 'aes-256-cbc';
const LEGACY_IV_LENGTH = 16;
function getKey(encryptionKey) {
    if (!encryptionKey || encryptionKey.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return Buffer.from(encryptionKey.slice(0, 32), 'utf8');
}
function encrypt(text, encryptionKey) {
    const key = getKey(encryptionKey);
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
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
function decrypt(encryptedText, encryptionKey) {
    if (!encryptedText) {
        throw new Error('Invalid encrypted payload format');
    }
    const parts = encryptedText.split(':');
    if (parts.length === 3) {
        const [ivB64, dataB64, authTagB64] = parts;
        if (!ivB64 || !dataB64 || !authTagB64) {
            throw new Error('Invalid encrypted payload format');
        }
        const key = getKey(encryptionKey);
        const iv = Buffer.from(ivB64, 'base64');
        const encrypted = Buffer.from(dataB64, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');
        const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
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
        const decipher = (0, crypto_1.createDecipheriv)(LEGACY_ALGORITHM, keyLegacy, ivLegacy);
        const decrypted = Buffer.concat([
            decipher.update(encryptedLegacy),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
    throw new Error('Invalid encrypted payload format');
}
//# sourceMappingURL=encryption.util.js.map