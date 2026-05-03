const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller.js");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth.middleware.js");
const { authorize } = require("../middleware/role.middleware.js");

const router = express.Router();

// ─────────────────────────────────────────────
// @desc    Validation rules for user registration
// ─────────────────────────────────────────────
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("Name must be between 2 and 30 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ─────────────────────────────────────────────
// @desc    Validation rules for email input
// ─────────────────────────────────────────────
const emailValidation = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
];

// ─────────────────────────────────────────────
// @desc    Validation rules for login
// ─────────────────────────────────────────────
const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─────────────────────────────────────────────
// @desc    Validation rules for password reset
// ─────────────────────────────────────────────
const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// ─────────────────────────────────────────────
// @desc    AUTH ROUTES
// @access  Public (unless stated otherwise)
// ─────────────────────────────────────────────

// @route   POST /api/v1/auth/register
router.post("/register", registerValidation, register);

// @route   POST /api/v1/auth/login
router.post("/login", loginValidation, login);

// @route   POST /api/v1/auth/logout
router.post("/logout", logout);

// @route   POST /api/v1/auth/refresh-token
router.post("/refresh-token", refreshToken);

// @route   GET /api/v1/auth/verify-email/:token
router.get("/verify-email/:token", verifyEmail);

// @route   POST /api/v1/auth/resend-verification
router.post("/resend-verification", emailValidation, resendVerification);

// @route   POST /api/v1/auth/forgot-password
router.post("/forgot-password", emailValidation, forgotPassword);

// @route   POST /api/v1/auth/reset-password/:token
router.post("/reset-password/:token", resetPasswordValidation, resetPassword);

// ─────────────────────────────────────────────
// EXPORT ROUTER
// ─────────────────────────────────────────────
module.exports = router;