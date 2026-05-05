const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  try {
    // This part generates the actual access token dynamically
    const { token } = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: token, // This is the key change
      },
    });

    return transporter;
  } catch (error) {
    console.error("Failed to create transporter:", error);
    throw error;
  }
};

const sendVerificationEmail = async (user, url) => {
  const transporter = await createTransporter();
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify your email",
    html: `<p>Click <a href="${url}">here</a> to verify.</p>`,
  });
};

const sendPasswordResetEmail = async (user, url) => {
  const transporter = await createTransporter();
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Password Reset",
    html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
