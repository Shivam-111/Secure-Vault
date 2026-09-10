const vaultService = require('../services/vault.service');

/**
 * Controller for POST /api/vault
 */
const create = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await vaultService.createEntry(userId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Controller for GET /api/vault
 */
const getAll = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await vaultService.getAllEntries(userId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Controller for GET /api/vault/:id
 */
const getOne = async (req, res) => {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const result = await vaultService.getEntryById(userId, entryId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Controller for PUT /api/vault/:id
 */
const update = async (req, res) => {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const result = await vaultService.updateEntry(userId, entryId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Controller for DELETE /api/vault/:id
 */
const remove = async (req, res) => {
  try {
    const userId = req.userId;
    const entryId = req.params.id;
    const result = await vaultService.deleteEntry(userId, entryId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove
};
