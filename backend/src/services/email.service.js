const nodemailer = require('nodemailer');

const getSmtpConfig = () => {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  return { host, user, pass, port };
};

/**
 * Check if SMTP configuration environment variables are available
 * @returns {boolean}
 */
const isSMTPConfigured = () => {
  const { host, user, pass } = getSmtpConfig();
  return Boolean(host && user && pass);
};

/**
 * Create Nodemailer SMTP transporter using environment configuration
 * @returns {Object|null} Nodemailer transporter instance or null if unconfigured
 */
const createTransporter = () => {
  if (!isSMTPConfigured()) {
    return null;
  }

  const { host, user, pass, port } = getSmtpConfig();
  const isGmail = host.includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  const isSecure = port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    requireTLS: !isSecure,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' }
  });
};

/**
 * Send 2FA OTP Email using Nodemailer
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} Status result
 */
const sendOTPEmail = async (toEmail, otp) => {
  if (!toEmail || !otp) {
    return { success: false, reason: 'Recipient email and OTP code are required' };
  }

  if (!isSMTPConfigured()) {
    console.warn('[EMAIL SERVICE WARNING] SMTP credentials not configured in backend/.env. Real email delivery skipped.');
    return {
      success: false,
      reason: 'SMTP credentials not configured',
      devNote: 'Email delivery skipped. Configure SMTP_USER and SMTP_PASS in .env to enable real email sending.'
    };
  }

  const { user } = getSmtpConfig();
  const fromAddress = (process.env.SMTP_FROM || '').trim() || `"SecureVault" <${user}>`;

  try {
    const transporter = createTransporter();

    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #111827;">
        <h2 style="margin: 0 0 8px; color: #0f172a;">SecureVault verification code</h2>
        <p style="margin: 0 0 16px; color: #4b5563;">Use this 6-digit code to finish signing in. It expires in 5 minutes.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a; margin: 24px 0;">${otp}</p>
        <p style="font-size: 13px; color: #6b7280;">If you did not try to sign in, you can ignore this email.</p>
      </div>
    `;

    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      replyTo: user,
      subject: 'Your SecureVault verification code',
      text: `Your SecureVault verification code is ${otp}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
      html: htmlContent,
      envelope: {
        from: user,
        to: toEmail
      },
      headers: {
        'X-Priority': '1',
        Importance: 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    const accepted = Array.isArray(info.accepted) ? info.accepted : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];

    if (rejected.length > 0) {
      console.error(
        `[EMAIL SERVICE ERROR] SMTP rejected recipient ${toEmail}. accepted=${JSON.stringify(accepted)} rejected=${JSON.stringify(rejected)}`
      );
      return {
        success: false,
        reason: 'SMTP server rejected the recipient address',
        accepted,
        rejected
      };
    }

    console.log(
      `[EMAIL SERVICE SUCCESS] OTP email sent to ${toEmail} (MessageId: ${info.messageId}, response: ${info.response || 'accepted'})`
    );

    return {
      success: true,
      messageId: info.messageId,
      accepted
    };
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${toEmail}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendOTPEmail,
  isSMTPConfigured
};
