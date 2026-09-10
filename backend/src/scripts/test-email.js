const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { sendOTPEmail, isSMTPConfigured } = require('../services/email.service');
const nodemailer = require('nodemailer');

async function runEmailTest() {
  console.log('--------------------------------------------------');
  console.log('📧 SecureVault Gmail SMTP Test Tool');
  console.log('--------------------------------------------------');

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  console.log(`SMTP Host: ${SMTP_HOST || '(not set)'}`);
  console.log(`SMTP Port: ${SMTP_PORT || '(not set)'}`);
  console.log(`SMTP User: ${SMTP_USER ? SMTP_USER : '(empty)'}`);
  console.log(`SMTP Pass: ${SMTP_PASS ? '******** (configured)' : '(empty)'}`);
  console.log(`SMTP From: ${SMTP_FROM || '(not set)'}`);
  console.log('--------------------------------------------------');

  if (!isSMTPConfigured()) {
    console.error('❌ FAILURE: SMTP credentials are incomplete in backend/.env');
    console.error('Please configure SMTP_USER and SMTP_PASS in backend/.env with your Gmail address and 16-character App Password.');
    console.error('\nNote: For Gmail, you must generate an App Password at:');
    console.error('https://myaccount.google.com/apppasswords (Requires 2-Step Verification enabled)');
    return;
  }

  // 1. Verify SMTP Connection
  console.log('🔄 Testing connection to SMTP server...');
  const port = parseInt(SMTP_PORT || '587', 10);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully!');
  } catch (verifyErr) {
    console.error('❌ SMTP Connection / Authentication Failed!');
    console.error('Error Code:', verifyErr.code || 'UNKNOWN');
    console.error('Error Message:', verifyErr.message);
    if (verifyErr.response) {
      console.error('SMTP Response:', verifyErr.response);
    }
    console.error('\n💡 Troubleshooting Tips for Gmail SMTP:');
    console.error(' 1. Ensure 2-Step Verification is turned ON for your Google account.');
    console.error(' 2. Use a 16-character App Password generated from Google Account > Security > App passwords.');
    console.error(' 3. Do NOT use your primary Google account password.');
    console.error(' 4. Check for typos in SMTP_USER or SMTP_PASS.');
    return;
  }

  // 2. Test Sending Email
  const targetEmail = process.argv[2] || SMTP_USER;
  console.log(`\n🔄 Attempting to send test OTP email to: ${targetEmail}`);

  const testOTP = '123456';
  const result = await sendOTPEmail(targetEmail, testOTP);

  if (result.success) {
    console.log('🎉 TEST EMAIL SENT SUCCESSFULLY!');
    console.log(`Message ID: ${result.messageId}`);
    console.log(`Please check the inbox of ${targetEmail} (including Spam/Junk folder) for the 2FA code: ${testOTP}`);
  } else {
    console.error('❌ Failed to send test email!');
    console.error('Reason:', result.error || result.reason);
  }
}

runEmailTest();
