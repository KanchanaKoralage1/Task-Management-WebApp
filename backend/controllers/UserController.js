const User = require("../models/User")
const fs = require("fs")
const path = require("path")
const jwt = require("jsonwebtoken") // Import jwt module

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Get user by ID (admin only)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    res.status(200).json({
      status: "success",
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body

    // Prevent password update through this route
    const updateData = { name, email, role }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    res.status(200).json({
      status: "success",
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    if (user.role === "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin accounts cannot be deleted through this route",
      })
    }

    await User.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: "success",
      data: null,
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    res.status(200).json({
      status: "success",
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body

    // Users can only update their name and email
    const updateData = { name, email }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    res.status(200).json({
      status: "success",
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    // Generate new token
    const token = signToken(user._id)

    res.status(200).json({
      status: "success",
      token,
      message: "Password updated successfully",
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      })
    }

    // Get the server URL
    const protocol = req.protocol
    const host = req.get("host")
    const baseUrl = `${protocol}://${host}`

    // Create the file URL
    const profilePicture = `${baseUrl}/uploads/${req.file.filename}`

    // Update user with new profile picture URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture },
      { new: true, runValidators: true },
    ).select("-password")

    res.status(200).json({
      status: "success",
      data: {
        user,
        profilePicture,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  })
}
