/**
 * Email Service
 * Handles sending payment confirmation and notification emails
 */

const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmationEmail = async ({
  email,
  name,
  amount,
  reference,
  type
}) => {
  try {
    const investmentType = {
      property: 'Property Investment',
      ajo: 'Ajo Savings',
      'target-savings': 'Target Savings',
      safelock: 'SafeLock'
    }[type] || 'Investment';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #09c398 0%, #08a57d 100%); color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #09c398; }
            .reference { background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
              <p>Your payment has been successfully processed</p>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              
              <p>Thank you for your ${investmentType} with PeraVest. Your payment has been successfully received and processed.</p>
              
              <h3>Payment Details</h3>
              <ul>
                <li><strong>Investment Type:</strong> ${investmentType}</li>
                <li><strong>Amount:</strong> <span class="amount">₦${Number(amount).toLocaleString()}</span></li>
                <li><strong>Reference:</strong> <span class="reference">${reference}</span></li>
                <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
              
              <p>Your investment is now active. You can track your progress in your dashboard.</p>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>PeraVest Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 PeraVest. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Payment Confirmation - ₦${Number(amount).toLocaleString()} ${investmentType}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

/**
 * Send payment failure email
 */
const sendPaymentFailureEmail = async ({
  email,
  name,
  amount,
  reference,
  reason
}) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; border: 1px solid #f5c6cb; }
            .content { padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
            .reference { background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; background: #09c398; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Failed</h1>
              <p>Your payment could not be processed</p>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              
              <p>Unfortunately, your payment could not be processed. Please review the details below and try again.</p>
              
              <h3>Payment Details</h3>
              <ul>
                <li><strong>Amount:</strong> <span class="amount">₦${Number(amount).toLocaleString()}</span></li>
                <li><strong>Reference:</strong> <span class="reference">${reference}</span></li>
                <li><strong>Reason:</strong> ${reason || 'Payment declined'}</li>
                <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
              
              <p>Please try again with a different payment method or contact our support team for assistance.</p>
              
              <a href="https://peravest.vercel.app/checkout" class="button">Retry Payment</a>
              
              <p>If you continue to experience issues, please contact our support team at support@peravest.com</p>
              
              <p>Best regards,<br>PeraVest Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 PeraVest. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Payment Failed - ₦${Number(amount).toLocaleString()}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment failure email sent to ${email}`);
  } catch (error) {
    console.error('Error sending payment failure email:', error);
    throw error;
  }
};

module.exports = {
  sendPaymentConfirmationEmail,
  sendPaymentFailureEmail
};
