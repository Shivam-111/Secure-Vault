const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes recommended for GCM

/**
 * Get and validate the 32-byte AES-256 encryption key from environment variables
 * @returns {Buffer} 32-byte Key Buffer
 */
const getEncryptionKey = () => {
  const rawKey = process.env.ENCRYPTION_KEY;

  if (!rawKey) {
    throw new Error('ENCRYPTION_KEY is missing from environment variables.');
  }
   
  let keyBuffer;
  // If provided as a 64-character hex string (32 bytes in hex)
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    keyBuffer = Buffer.from(rawKey, 'hex');
  } else {
    keyBuffer = Buffer.from(rawKey, 'utf8');
  }

  if (keyBuffer.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be exactly 32 bytes (or a 64-character hex string). Got ${keyBuffer.length} bytes.`);
  }

  return keyBuffer;
};

/**
 * Encrypt plaintext password using AES-256-GCM
 * @param {string} plaintext
 * @returns {Object} { encryptedPassword, iv, authTag } (all hex formatted strings)
 */
const encryptPassword = (plaintext) => {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Plaintext password string is required for encryption.');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedPassword: encrypted,
    iv: iv.toString('hex'),
    authTag
  };
};

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {Object} payload - { encryptedPassword, iv, authTag }
 * @returns {string} Original plaintext password
 */
const decryptPassword = ({ encryptedPassword, iv, authTag }) => {
  if (!encryptedPassword || !iv || !authTag) {
    throw new Error('Missing required encryption data (encryptedPassword, iv, authTag).');
  }

  try {
    const key = getEncryptionKey();
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    const customError = new Error('Decryption failed. Payload may be tampered with, corrupted, or key is invalid.');
    customError.statusCode = 400;
    throw customError;
  }
};

module.exports = {
  encryptPassword,
  decryptPassword
};
