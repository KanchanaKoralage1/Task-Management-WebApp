"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import axios from "axios"

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
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

  const handleManualSignup = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/signup", {
        name,
        email,
        password,
      })

      // Store user data and token directly since we're not using OTP verification
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      // Navigate to user dashboard (new users are always regular users)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
    }
  }

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/google-login", {
        token: credentialResponse.credential,
      })

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))

      // Navigate to user dashboard (Google users are always regular users)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Google signup failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Manual Signup Form */}
        <form onSubmit={handleManualSignup} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
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
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
            Sign Up
          </button>
        </form>

        {/* Google Signup */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Or sign up with Google</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSignupSuccess}
              onError={() => setError("Google signup failed")}
              useOneTap
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
