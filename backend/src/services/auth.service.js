const crypto = require('crypto');
const User = require('../models/User');
const { hashSHA256 } = require('../utils/hash.util');
const { generateToken, verifyToken } = require('../utils/jwt.util');
const { generateOTP } = require('../utils/otp.util');
const { sendOTPEmail } = require('./email.service');

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const hashesMatch = (storedHex, candidateHex) => {
  const a = Buffer.from(storedHex || '', 'utf8');
  const b = Buffer.from(candidateHex || '', 'utf8');
  if (a.length === 0 || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
};

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Object} Result object
 */
const registerUser = async ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const error = new Error('Name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error('Invalid email format');
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== 'string') {
    const error = new Error('Password is required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  await User.create({
    name: name.trim(),
    email: normalizedEmail,
    masterPasswordHash: hashSHA256(password),
    otpHash: null,
    otpExpiresAt: null,
    otpAttempts: 0
  });

  return {
    success: true,
    message: 'Account created successfully. Sign in and we will email a verification code to complete 2FA.'
  };
};

/**
 * Step 1: Login user credentials & email a 2FA OTP
 * @param {Object} credentials - { email, password }
 * @returns {Object} { success, mfaRequired, message, mfaToken }
 */
const loginUser = async ({ email, password }) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== 'string') {
    const error = new Error('Password is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const inputHash = hashSHA256(password);
  if (inputHash !== user.masterPasswordHash) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const otp = generateOTP();
  user.otpHash = hashSHA256(otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  await user.save();

  console.log(`[DEV OTP] Verification code generated for ${user.email}: ${otp}`);

  const emailResult = await sendOTPEmail(user.email, otp);
  if (!emailResult.success) {
    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();
    const error = new Error(
      'Could not send the verification code to your email. Check SMTP settings and try again.'
    );
    error.statusCode = 503;
    throw error;
  }

  const mfaToken = generateToken({ userId: user._id, isMfa: true }, '5m');

  return {
    success: true,
    mfaRequired: true,
    mfaMethod: 'email',
    message: 'A 6-digit verification code was sent to your registered email.',
    mfaToken
  };
};

/**
 * Step 2: Verify emailed 2FA OTP & issue full-access JWT
 * @param {Object} data - { mfaToken, otp }
 * @returns {Object} { success, message, token }
 */
const verifyOTP = async ({ mfaToken, otp }) => {
  if (!mfaToken || typeof mfaToken !== 'string') {
    const error = new Error('MFA Token is required');
    error.statusCode = 400;
    throw error;
  }

  if (!otp || typeof otp !== 'string' || !otp.trim()) {
    const error = new Error('OTP is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyToken(mfaToken);
  } catch (err) {
    const error = new Error('Invalid or expired MFA session. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  if (!decoded || !decoded.isMfa || !decoded.userId) {
    const error = new Error('Invalid MFA token payload');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.otpHash || !user.otpExpiresAt) {
    const error = new Error('No verification code is pending. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  if (new Date() > user.otpExpiresAt) {
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();
    const error = new Error('Verification code expired. Please log in again to receive a new email.');
    error.statusCode = 401;
    throw error;
  }

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();
    const error = new Error('Too many invalid codes. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  const isValid = hashesMatch(user.otpHash, hashSHA256(otp.trim()));
  if (!isValid) {
    user.otpAttempts += 1;
    await user.save();
    const error = new Error('Invalid or expired verification code');
    error.statusCode = 401;
    throw error;
  }

  user.otpHash = null;
  user.otpExpiresAt = null;
  user.otpAttempts = 0;
  await user.save();

  const token = generateToken({ userId: user._id }, '1d');

  return {
    success: true,
    message: 'OTP verified successfully. Login complete.',
    token
  };
};

/**
 * Get user profile by userId
 * @param {string} userId
 * @returns {Object} User profile details
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-masterPasswordHash -otpHash -otpExpiresAt -otpAttempts');
  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    success: true,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email
    }
  };
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  getUserProfile
};
