import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (!token) {
    return <Navigate to="/login" />
  }

  // If user is admin, redirect to admin dashboard
  if (user.role === "admin") {
    return <Navigate to="/admin" />
  }

  return children
}

export default ProtectedRoute
