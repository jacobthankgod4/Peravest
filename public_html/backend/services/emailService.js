const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendActivationEmail = async (email, token) => {
  const activationUrl = `${process.env.FRONTEND_URL}/activate-account?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Activate Your Account',
    html: `
      <h2>Account Activation</h2>
      <p>Click the link below to activate your account:</p>
      <a href="${activationUrl}">Activate Account</a>
      <p>This link expires in 24 hours.</p>
    `
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `
  });
};

const sendInvestmentConfirmation = async (email, investment) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Investment Confirmation',
    html: `
      <h2>Investment Confirmed</h2>
      <p>Your investment of ₦${investment.amount.toLocaleString()} has been confirmed.</p>
      <p>Expected returns: ₦${investment.expectedReturns.toLocaleString()}</p>
      <p>Maturity date: ${investment.maturityDate}</p>
    `
  });
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendInvestmentConfirmation
};