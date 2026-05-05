const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const sendEmail = async (options) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

  
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) reject("Failed to create access token :(");
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken,
      },
    });

    const mailOptions = {
      from: `"SecureAuth" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("OAuth/Email Error:", error);
    throw error;
  }
};

const sendVerificationEmail = async (user, VerificationUrl) => {
  const cleanUrl = VerificationUrl.trim();
  await sendEmail({
    email: user.email,
    subject: "Verify your email address - SecureAuth",
    html: `<h1>Verify your email</h1><p>Hi ${user.name}, click here: <a href="${cleanUrl}">${cleanUrl}</a></p>`, // Use your original design here
  });
  console.log("Email sent successfully via OAuth2 API");
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const cleanUrl = resetUrl.trim();
  await sendEmail({
    email: user.email,
    subject: "Reset your password - SecureAuth",
    html: `<h1>Reset Password</h1><p>Click here: <a href="${cleanUrl}">${cleanUrl}</a></p>`, // Use your original design here
  });
  console.log("Password reset email sent successfully");
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
