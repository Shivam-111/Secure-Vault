const jwt = require('jsonwebtoken');

/**
 * Sign a JWT token for user payload
 * @param {Object} payload - Object containing user claims (e.g. { userId })
 * @param {string} expiresIn - Expiration duration (default '1d')
 * @returns {string} Signed JWT token
 */
const generateToken = (payload, expiresIn = '1d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
