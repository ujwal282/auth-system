const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const sendEmail = async (options) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  try {
    // Manually fetch the access token
    const { token } = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
        family: 4,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: token,
      },
    });

    const mailOptions = {
      from: `SecureAuth <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    console.log("System: Sending email via OAuth2 API flow...");
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Critical Email Error:", error);
    throw error;
  }
};

const sendVerificationEmail = async (user, url) => {
  await sendEmail({
    email: user.email,
    subject: "Verify Email",
    html: `<p>Click <a href="${url}">here</a> to verify your account.</p>`,
  });
};

const sendPasswordResetEmail = async (user, url) => {
  await sendEmail({
    email: user.email,
    subject: "Reset Password",
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
