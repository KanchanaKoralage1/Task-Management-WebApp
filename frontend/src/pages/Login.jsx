"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import axios from "axios"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [forgotPassword, setForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [resetStep, setResetStep] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (token) {
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    }
  }, [navigate])

  const handleManualLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      })

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      // Redirect based on role
      if (response.data.data.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
  }

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      console.log("Google login success response:", credentialResponse)

      const response = await axios.post("http://localhost:5000/api/users/google-login", {
        token: credentialResponse.credential,
      })

      console.log("Backend response:", response.data)

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      // Redirect based on role
      if (response.data.data.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      console.error("Google login error details:", err.response || err)
      setError(err.response?.data?.message || "Google login failed")
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      await axios.post("http://localhost:5000/api/users/forgot-password", { email })
      setResetSent(true)
      setResetStep(2)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code")
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    try {
      await axios.post("http://localhost:5000/api/users/reset-password", {
        email,
        otp,
        newPassword,
      })
      setError("")
      setForgotPassword(false)
      setResetSent(false)
      alert("Password reset successful. Please login with your new password.")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password")
    }
  }

  if (forgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {resetStep === 1 && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Send Reset Code
              </button>
            </form>
          )}

          {resetStep === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <p className="text-green-600 text-sm mb-3">Reset code sent to your email!</p>
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Reset Password
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setForgotPassword(false)
              setError("")
            }}
            className="mt-3 text-sm text-blue-500 hover:underline w-full text-center"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
            Login
          </button>
        </form>

        <button
          onClick={() => setForgotPassword(true)}
          className="mt-2 text-sm text-blue-500 hover:underline w-full text-center"
        >
          Forgot Password?
        </button>

        {/* Google Login */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Or login with Google</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.error("Google login failed")
                setError("Google login failed")
              }}
              useOneTap
              flow="implicit"
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-center">
          Need an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
