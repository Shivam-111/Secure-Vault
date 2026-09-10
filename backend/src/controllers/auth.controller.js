const authService = require('../services/auth.service');

/**
 * Controller for POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
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
 * Controller for POST /api/auth/login (Triggers email 2FA OTP)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
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
 * Controller for POST /api/auth/verify-otp (Verifies OTP & issues JWT)
 */
const verifyOTP = async (req, res) => {
  try {
    const { mfaToken, otp } = req.body;
    const result = await authService.verifyOTP({ mfaToken, otp });
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
 * Controller for GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await authService.getUserProfile(userId);
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
  register,
  login,
  verifyOTP,
  getProfile
};
