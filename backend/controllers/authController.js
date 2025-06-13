const User = require("../models/User")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { OAuth2Client } = require("google-auth-library")
const { sendEmail } = require("../utils/emailUtils")

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  })
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTPs with expiry (in-memory for simplicity, use Redis in production)
const otpStore = new Map()

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Only allow admin creation if explicitly specified and JWT_ADMIN_SECRET matches
    if (role === "admin" && req.headers["admin-secret"] !== process.env.JWT_ADMIN_SECRET) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to create admin user",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      })
    }

    // Create user directly without OTP verification
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      emailVerified: true, // Mark as verified since we're skipping verification
    })

    const token = signToken(user._id)

    // Remove password from output
    user.password = undefined

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body

    const storedData = otpStore.get(email)

    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification code",
      })
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email)
      return res.status(400).json({
        status: "error",
        message: "Verification code has expired",
      })
    }

    // Create user after verification
    const user = await User.create(storedData.userData)

    // Remove OTP data
    otpStore.delete(email)

    const token = signToken(user._id)

    // Remove password from output
    user.password = undefined

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      })
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect email or password",
      })
    }

    const token = signToken(user._id)

    // Remove password from output
    user.password = undefined

    res.status(200).json({
      status: "success",
      token,
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, name, picture } = payload

    // Check if user exists
    let user = await User.findOne({ email })

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email,
        name,
        password: crypto.randomBytes(16).toString("hex"), // Random password
        profilePicture: picture,
        googleId: payload.sub,
      })
    }

    const jwtToken = signToken(user._id)

    res.status(200).json({
      status: "success",
      token: jwtToken,
      data: { user },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No user found with that email address",
      })
    }

    // Generate OTP for password reset
    const otp = generateOTP()

    // Store OTP with 10 minute expiry
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      userId: user._id,
    })

    // Send password reset email
    await sendEmail({
      email,
      subject: "Password Reset Code",
      message: `Your password reset code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <h1>Password Reset</h1>
        <p>Your password reset code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    })

    res.status(200).json({
      status: "success",
      message: "Password reset code sent to email",
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const storedData = otpStore.get(email)

    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset code",
      })
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email)
      return res.status(400).json({
        status: "error",
        message: "Reset code has expired",
      })
    }

    // Update user password
    const user = await User.findById(storedData.userId)
    user.password = newPassword
    await user.save()

    // Remove OTP data
    otpStore.delete(email)

    const token = signToken(user._id)

    res.status(200).json({
      status: "success",
      token,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}
