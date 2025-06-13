const express = require("express")
const router = express.Router()
const User = require("../models/User")
const {
  signup,
  verifyEmail,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController")
const { protect, restrictTo } = require("../middlewares/AuthMiddleware")
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} = require("../controllers/UserController")

// Public auth routes
router.post("/signup", signup)
router.post("/verify-email", verifyEmail)
router.post("/login", login)
router.post("/google-login", googleLogin)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// Protected routes
router.get("/profile", protect, getProfile)
router.patch("/update-profile", protect, updateProfile)

// Admin only routes
router.get("/all-users", protect, restrictTo("admin"), getAllUsers)
router.get("/user/:id", protect, restrictTo("admin"), getUser)
router.patch("/user/:id", protect, restrictTo("admin"), updateUser)
router.delete("/user/:id", protect, restrictTo("admin"), deleteUser)

module.exports = router
