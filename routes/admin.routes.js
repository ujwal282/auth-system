const express = require("express");

const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const {
  adminDashboard,
  deleteUser,
} = require("../controllers/admin.controller");

const router = express.Router();

// ─────────────────────────────────────────────
// @desc    Admin dashboard
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin only)
// ─────────────────────────────────────────────
router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  adminDashboard
);

// ─────────────────────────────────────────────
// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;