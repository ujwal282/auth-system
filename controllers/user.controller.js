const User = require("../models/user.model.js");

// ─────────────────────────────────────────────
// @desc    Getting User information
// @route   POST /api/v1/auth/me
// @access  Private
// ─────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    };

    res.status(200).json({
      success: true,
      user:{
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      }
    });
    

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Getting User dashboard
// @route   GET /api/v1/auth/user-dashboard
// @access  Private
//

const userDashboard = async (req, res) => {
  res.json({
    success: true,
    message: "User Dashboard",
  });
};

module.exports = { getProfile, userDashboard };
