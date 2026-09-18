const crypto = require('crypto');
const SecretShare = require('../models/secretShare.model');
const { encryptPassword, decryptPassword } = require('./encryption.service');

/**
 * Hash passcode using native Node crypto pbkdf2
 */
const hashPasscode = (passcode) => {
  if (!passcode) return null;
  return crypto.pbkdf2Sync(passcode, 'securevault_passcode_salt', 10000, 32, 'sha256').toString('hex');
};

const verifyPasscode = (inputPasscode, storedHash) => {
  if (!storedHash) return true;
  if (!inputPasscode) return false;
  const hash = hashPasscode(inputPasscode);
  return hash === storedHash;
};

/**
 * Generate a high-entropy secret share link
 */
const createSecretShare = async ({ secretText, title, maxViews = 1, expiryMinutes = 60, passcode = null, userId = null }) => {
  if (!secretText || typeof secretText !== 'string') {
    const err = new Error('Secret content is required.');
    err.statusCode = 400;
    throw err;
  }

  const shareToken = crypto.randomBytes(24).toString('hex');
  const { encryptedPassword, iv, authTag } = encryptPassword(secretText);

  let passcodeHash = null;
  if (passcode && passcode.trim()) {
    passcodeHash = hashPasscode(passcode.trim());
  }

  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const secretShare = await SecretShare.create({
    shareToken,
    encryptedContent: encryptedPassword,
    iv,
    authTag,
    title: title || 'Encrypted Secret Note',
    maxViews: Math.min(Math.max(1, Number(maxViews) || 1), 50),
    viewCount: 0,
    expiresAt,
    passcodeHash,
    createdBy: userId || null
  });

  return {
    shareToken: secretShare.shareToken,
    title: secretShare.title,
    maxViews: secretShare.maxViews,
    expiresAt: secretShare.expiresAt,
    hasPasscode: Boolean(passcodeHash)
  };
};

/**
 * Retrieve secret meta (check if valid, view count, passcode requirement) without revealing secret
 */
const getSecretMeta = async (shareToken) => {
  const secretShare = await SecretShare.findOne({ shareToken });

  if (!secretShare || secretShare.isBurned || new Date() > secretShare.expiresAt) {
    const err = new Error('Secret not found, expired, or has already been burned.');
    err.statusCode = 404;
    throw err;
  }

  return {
    shareToken: secretShare.shareToken,
    title: secretShare.title,
    maxViews: secretShare.maxViews,
    viewCount: secretShare.viewCount,
    remainingViews: secretShare.maxViews - secretShare.viewCount,
    expiresAt: secretShare.expiresAt,
    requiresPasscode: Boolean(secretShare.passcodeHash),
    createdAt: secretShare.createdAt
  };
};

/**
 * Reveal secret content & execute auto-burn if maxViews reached
 */
const revealSecret = async (shareToken, passcode = null) => {
  const secretShare = await SecretShare.findOne({ shareToken });

  if (!secretShare || secretShare.isBurned || new Date() > secretShare.expiresAt) {
    const err = new Error('Secret not found, expired, or has already been burned.');
    err.statusCode = 404;
    throw err;
  }

  // Check passcode if required
  if (secretShare.passcodeHash) {
    if (!passcode) {
      const err = new Error('Passcode required to view this secret.');
      err.statusCode = 401;
      throw err;
    }
    const isMatch = verifyPasscode(passcode, secretShare.passcodeHash);
    if (!isMatch) {
      const err = new Error('Incorrect passcode.');
      err.statusCode = 403;
      throw err;
    }
  }

  // Decrypt secret
  const plaintext = decryptPassword({
    encryptedPassword: secretShare.encryptedContent,
    iv: secretShare.iv,
    authTag: secretShare.authTag
  });

  // Increment view count
  secretShare.viewCount += 1;

  const isFinalView = secretShare.viewCount >= secretShare.maxViews;

  if (isFinalView) {
    secretShare.isBurned = true;
  }

  await secretShare.save();

  // If burned, remove content from DB immediately for true zero-knowledge privacy
  if (isFinalView) {
    await SecretShare.deleteOne({ _id: secretShare._id });
  }

  return {
    secretText: plaintext,
    title: secretShare.title,
    viewCount: secretShare.viewCount,
    maxViews: secretShare.maxViews,
    isBurned: isFinalView
  };
};

/**
 * Manually burn a secret share before view limit/expiry
 */
const burnSecret = async (shareToken) => {
  const secretShare = await SecretShare.findOne({ shareToken });
  if (!secretShare) {
    const err = new Error('Secret not found.');
    err.statusCode = 404;
    throw err;
  }

  await SecretShare.deleteOne({ _id: secretShare._id });
  return { success: true, message: 'Secret permanently destroyed.' };
};

module.exports = {
  createSecretShare,
  getSecretMeta,
  revealSecret,
  burnSecret
};
