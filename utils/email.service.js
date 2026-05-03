const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendVerificationEmail = async (user, VerificationUrl) => {
  try {
    const trasnsporter = createTransporter();
    const cleanUrl = VerificationUrl.trim();

    const message = {
      from: `"SecureAuth" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify your email address - SecureAuth",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; margin: 0; padding: 40px 20px; }
            .container { max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .header { padding: 40px 32px 0 32px; text-align: center; }
            .logo { width: 48px; height: 48px; background: #000000; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; }
            .logo-icon { width: 24px; height: 24px; fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
            .title { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #111827; }
            .content { padding: 32px; }
            .greeting { font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #111827; }
            .text { font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0; }
            .btn-container { text-align: center; margin: 32px 0; }
            .btn { display: inline-block; background-color: #000000; color: #ffffff !important; font-weight: 500; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; }
            .fallback { font-size: 13px; color: #6b7280; text-align: center; }
            .fallback-url { background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; margin-top: 8px; color: #4b5563; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .footer { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; }
            .footer-text { font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg class="logo-icon" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h1 class="title">Verify your email</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi ${user.name || 'there'},</p>
              <p class="text">Welcome to SecureAuth! Please verify your email address to get full access to your account. This link will expire in 24 hours.</p>
              <div class="btn-container">
                <a href="${cleanUrl}" class="btn">Verify Email Address</a>
              </div>
              <div class="fallback">
                <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="fallback-url">${cleanUrl}</div>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">You received this because you signed up for SecureAuth.</p>
              <p class="footer-text">© ${new Date().getFullYear()} SecureAuth</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    await trasnsporter.sendMail(message);
    console.log("Email sent sucessfully");
  } catch (error) {
    console.error("Email Service ERROR", error.message);
  }
};

const sendPasswordResetEmail = async (user, resetUrl)=> {
  try {
    const transporter = createTransporter();
    const cleanUrl = resetUrl.trim();

    const message = {
      from: `"SecureAuth" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password - SecureAuth",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; margin: 0; padding: 40px 20px; }
            .container { max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .header { padding: 40px 32px 0 32px; text-align: center; }
            .logo { width: 48px; height: 48px; background: #000000; border-radius: 12px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; }
            .logo-icon { width: 24px; height: 24px; fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
            .title { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #111827; }
            .content { padding: 32px; }
            .greeting { font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #111827; }
            .text { font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0; }
            .btn-container { text-align: center; margin: 32px 0; }
            .btn { display: inline-block; background-color: #000000; color: #ffffff !important; font-weight: 500; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; }
            .fallback { font-size: 13px; color: #6b7280; text-align: center; }
            .fallback-url { background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; margin-top: 8px; color: #4b5563; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .footer { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; }
            .footer-text { font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg class="logo-icon" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h1 class="title">Reset your password</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi ${user.name || 'there'},</p>
              <p class="text">We received a request to reset your SecureAuth password. Click the button below to choose a new one. This link will expire in 15 minutes.</p>
              <div class="btn-container">
                <a href="${cleanUrl}" class="btn">Reset Password</a>
              </div>
              <p class="text" style="font-size: 13px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email.</p>
              <div class="fallback">
                <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="fallback-url">${cleanUrl}</div>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">You received this because a password reset was requested for your SecureAuth account.</p>
              <p class="footer-text">© ${new Date().getFullYear()} SecureAuth</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(message);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Email Service ERROR", error.message);
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };