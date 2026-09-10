const crypto = require('crypto');

/**
 * Generate a secure 6-digit numeric OTP string
 * @returns {string} 6-digit numeric string (e.g. '482910')
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = {
  generateOTP
};
