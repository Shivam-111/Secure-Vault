const secretShareService = require('../services/secretShare.service');

const createSecret = async (req, res, next) => {
  try {
    const { secretText, title, maxViews, expiryMinutes, passcode } = req.body;
    const userId = req.user ? req.user.id : null;

    const result = await secretShareService.createSecretShare({
      secretText,
      title,
      maxViews,
      expiryMinutes,
      passcode,
      userId
    });

    const fullUrl = `${req.protocol}://${req.get('host')}/share/${result.shareToken}`;

    return res.status(201).json({
      success: true,
      message: 'Self-destructing secret created successfully.',
      data: {
        ...result,
        shareUrl: fullUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSecretMeta = async (req, res, next) => {
  try {
    const { token } = req.params;
    const meta = await secretShareService.getSecretMeta(token);

    return res.status(200).json({
      success: true,
      data: meta
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Secret not found, expired, or already destroyed.'
      });
    }
    next(error);
  }
};

const revealSecret = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { passcode } = req.body;

    const result = await secretShareService.revealSecret(token, passcode);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const burnSecret = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await secretShareService.burnSecret(token);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Secret not found or already destroyed.'
      });
    }
    next(error);
  }
};

module.exports = {
  createSecret,
  getSecretMeta,
  revealSecret,
  burnSecret
};
