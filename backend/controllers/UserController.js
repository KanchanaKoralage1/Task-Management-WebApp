const User = require("../models/User")

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
