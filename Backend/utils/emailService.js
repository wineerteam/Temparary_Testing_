import nodemailer from "nodemailer";

/**
 * Send an email using SMTP or a fallback test account.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 */
export const sendEmail = async ({ to, subject, html }) => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  let transporter;

  if (host && user && pass) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  } else {
    // Fallback: Ethereal Email (Mock SMTP service for development)
    console.log("⚠️ SMTP credentials not fully configured in .env. Creating a temporary Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"SkyGPT" <no-reply@skygpt.com>',
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If using Ethereal, log the test email URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("-----------------------------------------");
    console.log(`📧 Test Email Sent Successfully!`);
    console.log(`Preview URL: ${previewUrl}`);
    console.log("-----------------------------------------");
    return { ...info, previewUrl };
  }

  return info;
};
