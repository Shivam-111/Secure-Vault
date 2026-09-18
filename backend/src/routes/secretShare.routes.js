const express = require('express');
const router = express.Router();
const secretShareController = require('../controllers/secretShare.controller');

// Public endpoints (optional token auth if logged in)
router.post('/', secretShareController.createSecret);
router.get('/:token/meta', secretShareController.getSecretMeta);
router.post('/:token/reveal', secretShareController.revealSecret);
router.delete('/:token', secretShareController.burnSecret);

module.exports = router;
