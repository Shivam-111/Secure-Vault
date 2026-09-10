const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vault.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Apply JWT authentication middleware to all vault endpoints
router.use(authenticateToken);

// POST /api/vault
router.post('/', vaultController.create);

// GET /api/vault
router.get('/', vaultController.getAll);

// GET /api/vault/:id
router.get('/:id', vaultController.getOne);

// PUT /api/vault/:id
router.put('/:id', vaultController.update);

// DELETE /api/vault/:id
router.delete('/:id', vaultController.remove);

module.exports = router;
