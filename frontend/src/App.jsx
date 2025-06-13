import { Routes, Route, Navigate } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import UserDashboard from "./pages/UserDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"

const App = () => {
  // Log the client ID being used to help with debugging
  const clientId = "21099393576-e6mg5qlctsa1mdaj4bhv65ervcmn2a5m.apps.googleusercontent.com"
  console.log("Using Google OAuth Client ID:", clientId)

  return (
    <GoogleOAuthProvider
      clientId={clientId}
      onScriptLoadError={(err) => console.error("Google script load error:", err)}
      onScriptLoadSuccess={() => console.log("Google script loaded successfully")}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App
