const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email.service.js");
const crypto = require("crypto");

// ─────────────────────────────────────────────
// Helper: Sign tokens & send response
// ─────────────────────────────────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  res
    .status(statusCode)
    .cookie("token", accessToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
};

// ─────────────────────────────────────────────
// @desc    Register new user & send verification email
// @route   POST /api/v1/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate verification token and save to DB
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendVerificationEmail(user, verificationUrl);
      res.status(201).json({
        success: true,
        message: "Check your email",
      });
    } catch (error) {
      console.error(error);
      // Clear token fields if email fails
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Verify email using token from URL
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
// ─────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Hash the raw token from the URL to match the stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid link: token expired or already used",
      });
    }

    // Mark email as verified and clear token fields
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
// ─────────────────────────────────────────────
const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found !!",
      });
    }

    // Checking if user is verified or not

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate a fresh verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendVerificationEmail(user, verificationUrl);

    res.status(200).json({
      success: true,
      message: "Email resent",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Login user & return tokens
// @route   POST /api/v1/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Select password explicitly since it's set to select: false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
// ─────────────────────────────────────────────
const logout = async (req, res) => {
  // Clear refreshToken from DB if user is attached to request
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: undefined });
  }

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

// ─────────────────────────────────────────────
// @desc    Refresh access token using refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
// ─────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No token found !!",
    });
  }

  try {
    // Verify the incoming refresh token
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken.id);

    // Check user exists and token matches the one stored in DB
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token !!",
      });
    }

    // Sign new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    // Rotate refresh token (invalidates the old one)
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    // Save new refresh token to DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    // Differentiate between expired and invalid tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired, please login again",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token !!",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Forgot password using email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found !!",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetUrl);
      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email",
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Reset password using token from URL
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated !!",
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
