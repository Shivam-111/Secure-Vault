const mongoose = require('mongoose');
const VaultEntry = require('../models/VaultEntry');
const { encryptPassword, decryptPassword } = require('./encryption.service');

/**
 * Validate MongoDB ObjectId format
 * @param {string} id
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Create a new vault credential entry with AES-256-GCM encryption
 * @param {string} userId - Authenticated user ID
 * @param {Object} entryData - { website, username, password, notes }
 */
const createEntry = async (userId, { website, username, password, notes }) => {
  if (!website || typeof website !== 'string' || !website.trim()) {
    const error = new Error('Website is required');
    error.statusCode = 400;
    throw error;
  }

  if (!username || typeof username !== 'string' || !username.trim()) {
    const error = new Error('Username is required');
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== 'string' || !password) {
    const error = new Error('Password is required');
    error.statusCode = 400;
    throw error;
  }

  // Encrypt plaintext password using AES-256-GCM
  const { encryptedPassword, iv, authTag } = encryptPassword(password);

  const newEntry = await VaultEntry.create({
    userId,
    website: website.trim(),
    username: username.trim(),
    encryptedPassword,
    iv,
    authTag,
    notes: notes && typeof notes === 'string' ? notes.trim() : ''
  });

  return {
    success: true,
    message: 'Credential saved successfully',
    data: {
      _id: newEntry._id,
      userId: newEntry.userId,
      website: newEntry.website,
      username: newEntry.username,
      notes: newEntry.notes,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt
    }
  };
};

/**
 * Get all vault entries for the authenticated user (metadata list)
 * @param {string} userId
 */
const getAllEntries = async (userId) => {
  const entries = await VaultEntry.find({ userId }).sort({ createdAt: -1 });
  
  const sanitizedEntries = entries.map((entry) => ({
    _id: entry._id,
    userId: entry.userId,
    website: entry.website,
    username: entry.username,
    notes: entry.notes,
    hasEncryptedPassword: true,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  }));

  return {
    success: true,
    count: sanitizedEntries.length,
    data: sanitizedEntries
  };
};

/**
 * Get a single vault entry by ID and decrypt password for the authenticated owner
 * @param {string} userId
 * @param {string} entryId
 */
const getEntryById = async (userId, entryId) => {
  if (!isValidObjectId(entryId)) {
    const error = new Error('Invalid entry ID format');
    error.statusCode = 400;
    throw error;
  }

  const entry = await VaultEntry.findById(entryId);
  if (!entry) {
    const error = new Error('Vault entry not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership Check
  if (entry.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied. You do not own this credential');
    error.statusCode = 403;
    throw error;
  }

  // Decrypt password using AES-256-GCM
  const decryptedPassword = decryptPassword({
    encryptedPassword: entry.encryptedPassword,
    iv: entry.iv,
    authTag: entry.authTag
  });

  return {
    success: true,
    data: {
      _id: entry._id,
      userId: entry.userId,
      website: entry.website,
      username: entry.username,
      password: decryptedPassword,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  };
};

/**
 * Update a vault entry by ID with ownership enforcement and optional re-encryption
 * @param {string} userId
 * @param {string} entryId
 * @param {Object} updateData - { website, username, password, notes }
 */
const updateEntry = async (userId, entryId, updateData) => {
  if (!isValidObjectId(entryId)) {
    const error = new Error('Invalid entry ID format');
    error.statusCode = 400;
    throw error;
  }

  const entry = await VaultEntry.findById(entryId);
  if (!entry) {
    const error = new Error('Vault entry not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership Check
  if (entry.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied. You do not own this credential');
    error.statusCode = 403;
    throw error;
  }

  // Update website
  if (updateData.website !== undefined) {
    if (!updateData.website || !updateData.website.trim()) {
      const error = new Error('Website cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    entry.website = updateData.website.trim();
  }

  // Update username
  if (updateData.username !== undefined) {
    if (!updateData.username || !updateData.username.trim()) {
      const error = new Error('Username cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    entry.username = updateData.username.trim();
  }

  // Re-encrypt password if a new password string is provided
  if (updateData.password !== undefined) {
    if (!updateData.password) {
      const error = new Error('Password cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    const encrypted = encryptPassword(updateData.password);
    entry.encryptedPassword = encrypted.encryptedPassword;
    entry.iv = encrypted.iv;
    entry.authTag = encrypted.authTag;
  }

  // Update notes
  if (updateData.notes !== undefined) {
    entry.notes = typeof updateData.notes === 'string' ? updateData.notes.trim() : '';
  }

  await entry.save();

  // Decrypt to return updated payload
  const decryptedPassword = decryptPassword({
    encryptedPassword: entry.encryptedPassword,
    iv: entry.iv,
    authTag: entry.authTag
  });

  return {
    success: true,
    message: 'Credential updated successfully',
    data: {
      _id: entry._id,
      userId: entry.userId,
      website: entry.website,
      username: entry.username,
      password: decryptedPassword,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  };
};

/**
 * Delete a vault entry by ID with ownership enforcement
 * @param {string} userId
 * @param {string} entryId
 */
const deleteEntry = async (userId, entryId) => {
  if (!isValidObjectId(entryId)) {
    const error = new Error('Invalid entry ID format');
    error.statusCode = 400;
    throw error;
  }

  const entry = await VaultEntry.findById(entryId);
  if (!entry) {
    const error = new Error('Vault entry not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership Check
  if (entry.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied. You do not own this credential');
    error.statusCode = 403;
    throw error;
  }

  await entry.deleteOne();

  return {
    success: true,
    message: 'Credential deleted successfully'
  };
};

module.exports = {
  createEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry
};
