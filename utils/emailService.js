// utils/emailService.js
const sgMail = require("@sendgrid/mail");

// Set your SendGrid API key (use environment variable for security)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - HTML content
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL, // Verified sender
      subject,
      text,
      html,
    };

    const result = await sgMail.send(msg);
    console.log("✅ Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.body || error.message);
    throw error;
  }
}

module.exports = { sendEmail };
