import { Navigate } from "react-router-dom"

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (!token) {
    return <Navigate to="/login" />
  }

  // If user is not admin, redirect to user dashboard
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default AdminRoute
