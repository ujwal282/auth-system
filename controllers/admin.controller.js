const User = require("../models/user.model.js");
// ─────────────────────────────────────────────
// @desc    Admin dashboard
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin only)
// ─────────────────────────────────────────────
const adminDashboard = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Admin Dashboard",
      users,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { name } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  adminDashboard,
  deleteUser,
};
