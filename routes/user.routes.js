const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getProfile, userDashboard } = require("../controllers/user.controller");

const router = express.Router();

// @route GET /api/v1/profile
router.get("/profile", protect, getProfile);

//@route GET /api/v1/ashboard
router.get("/dashboard", protect, userDashboard);

module.exports = router;