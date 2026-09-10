const crypto = require('crypto');

/**
 * Generate SHA-256 hash string for input text
 * @param {string} text
 * @returns {string} SHA-256 hex string
 */
const hashSHA256 = (text) => {
  if (!text) return '';
  return crypto.createHash('sha256').update(text).digest('hex');
};

module.exports = {
  hashSHA256
};
