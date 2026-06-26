const crypto = require('crypto');
const config = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encryption utility for sensitive fields (PII, bank details, etc.)
 * Uses AES-256-GCM with configurable encryption key from env.
 */
class EncryptionService {
  constructor() {
    this.key = this._deriveKey(config.encryptionKey || 'default-dev-key-change-in-production');
  }

  /**
   * Derive a 256-bit key from the config key using PBKDF2
   */
  _deriveKey(key) {
    return crypto.scryptSync(key, 'gomotarcar-encryption-salt', 32);
  }

  /**
   * Encrypt plaintext data
   * Returns: { encrypted: string (hex), iv: string (hex), tag: string (hex) }
   */
  encrypt(plaintext) {
    if (!plaintext) return null;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag,
    };
  }

  /**
   * Decrypt data
   * @param {string|object} encryptedData - The hex string or { encrypted, iv, tag } object
   * @param {string} iv - IV hex string (if first param is string)
   * @param {string} tag - Auth tag hex string (if first param is string)
   */
  decrypt(encryptedData, iv, tag) {
    if (!encryptedData) return null;

    let enc, ivHex, authTag;

    if (typeof encryptedData === 'object') {
      enc = encryptedData.encrypted;
      ivHex = encryptedData.iv;
      authTag = encryptedData.tag;
    } else {
      enc = encryptedData;
      ivHex = iv;
      authTag = tag;
    }

    if (!enc || !ivHex || !authTag) return null;

    try {
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        this.key,
        Buffer.from(ivHex, 'hex')
      );
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(enc, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Decryption failed:', err.message);
      return null;
    }
  }

  /**
   * Encrypt an entire object's sensitive fields in-place
   * @param {object} obj - The object to process
   * @param {string[]} fields - Array of field paths to encrypt (e.g., ['bankDetails.accountNumber'])
   */
  encryptFields(obj, fields) {
    const clone = { ...obj };
    for (const field of fields) {
      const value = this._getNested(clone, field);
      if (value && typeof value === 'string') {
        this._setNested(clone, field, this.encrypt(value));
      }
    }
    return clone;
  }

  _getNested(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  _setNested(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

module.exports = new EncryptionService();
