"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"

const AdminDashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"))
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("users")
  const [editingUser, setEditingUser] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
  })
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedTo: "",
    status: "pending",
  })
  const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedTo: "",
    status: "pending",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemType: null,
  })
  const [profileImage, setProfileImage] = useState(user.profilePicture || "")
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)
  const [showProfileSection, setShowProfileSection] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserProfile()

    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "tasks") {
      fetchTasks()
    }
  }, [activeTab, searchTerm, statusFilter])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const userData = response.data.data.user
      setUser(userData)
      setProfileImage(userData.profilePicture || "")
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (err) {
      console.error("Failed to fetch user profile:", err)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get("http://localhost:5000/api/users/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUsers(response.data.data.users)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users")
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get(`http://localhost:5000/api/tasks?search=${searchTerm}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setTasks(response.data.data.tasks)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks")
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    })
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")

      await axios.patch(`http://localhost:5000/api/users/user/${editingUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user")
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setEditTaskForm({
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline).toISOString().split("T")[0],
      assignedTo: task.assignedTo?._id || "",
      status: task.status,
    })
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")

      await axios.patch(`http://localhost:5000/api/tasks/${editingTask._id}`, editTaskForm, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setEditingTask(null)
      fetchTasks()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task")
    }
  }

  const openDeleteModal = (id, type) => {
    setDeleteModal({
      isOpen: true,
      itemId: id,
      itemType: type,
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      itemId: null,
      itemType: null,
    })
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token")

      if (deleteModal.itemType === "user") {
        await axios.delete(`http://localhost:5000/api/users/user/${deleteModal.itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchUsers()
      } else if (deleteModal.itemType === "task") {
        await axios.delete(`http://localhost:5000/api/tasks/${deleteModal.itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchTasks()
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${deleteModal.itemType}`)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")

      await axios.post("http://localhost:5000/api/tasks", taskForm, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setTaskForm({
        title: "",
        description: "",
        deadline: "",
        assignedTo: "",
        status: "pending",
      })

      fetchTasks()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task")
    }
  }

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token")

      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task status")
    }
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Preview the image
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // If there's a new profile image, upload it
      if (imageFile) {
        const formData = new FormData()
        formData.append("profileImage", imageFile)

        const imageResponse = await axios.post("http://localhost:5000/api/users/upload-profile-picture", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })

        // Update the profile picture URL
        const updatedUser = {
          ...user,
          profilePicture: imageResponse.data.data.profilePicture,
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setSuccess("Profile picture updated successfully")

        // Reset the image file state
        setImageFile(null)
      }

      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile picture")
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get("http://localhost:5000/api/tasks/report", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const tasks = response.data.data.tasks

      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text("Task Management Report", 14, 22)

      doc.setFontSize(11)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

      doc.text(`Generated by: ${user.name} (Admin)`, 14, 38)

      const tableColumn = ["Title", "Description", "Deadline", "Assigned To", "Status", "Created By"]
      const tableRows = []

      tasks.forEach((task) => {
        const taskData = [
          task.title,
          task.description.substring(0, 20) + (task.description.length > 20 ? "..." : ""),
          new Date(task.deadline).toLocaleDateString(),
          task.assignedTo?.name || "N/A",
          task.status,
          task.createdBy?.name || "N/A",
        ]
        tableRows.push(taskData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
        },
        headStyles: { fillColor: [66, 139, 202] },
      })

      doc.save(`task-management-report-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err) {
      console.error("PDF generation error:", err)
      setError("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div
                className="h-8 w-8 rounded-full overflow-hidden cursor-pointer"
                onClick={() => setShowProfileSection(!showProfileSection)}
              >
                {profileImage ? (
                  <img src={profileImage || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                    </span>
                  </div>
                )}
              </div>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 ml-2">
                {user.name}
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      {showProfileSection && (
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Admin Profile</h2>
              <Link to="/profile" className="text-blue-500 hover:text-blue-700 text-sm">
                View Full Profile
              </Link>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden cursor-pointer mb-4 relative"
                  onClick={handleImageClick}
                >
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all">
                    <span className="text-white opacity-0 hover:opacity-100">Change Photo</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="text-blue-500 hover:text-blue-700 text-sm mb-2"
                >
                  Upload New Photo
                </button>
                {imageFile && (
                  <button
                    onClick={handleProfileUpdate}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Photo"}
                  </button>
                )}
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("users")}
                className={
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                }
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={
                  activeTab === "tasks"
                    ? "border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                }
              >
                Task Management
              </button>
            </nav>
          </div>

          {/* Error Message */}
          {error && !showProfileSection && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">User Management</h2>

              {loading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-4">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture || "/placeholder.svg"}
                                  alt="Profile"
                                  className="h-10 w-10 rounded-full mr-3 object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-gray-600">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                  </span>
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            {user.role !== "admin" && (
                              <button
                                onClick={() => openDeleteModal(user._id, "user")}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Edit User Modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">Edit User</h3>
                    <form onSubmit={handleUpdateUser}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Task Management Tab */}
          {activeTab === "tasks" && (
            <div>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">Create New Task</h2>
                <form onSubmit={handleCreateTask}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Deadline</label>
                      <input
                        type="date"
                        value={taskForm.deadline}
                        onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Assigned To</label>
                      <select
                        value={taskForm.assignedTo}
                        onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select User</option>
                        {users
                          .filter((u) => u.role === "user")
                          .map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">All Tasks</h2>
                  <button
                    onClick={generatePDF}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Export PDF
                  </button>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-4">No tasks found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deadline
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned To
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                          <tr key={task._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {task.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{task.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(task.deadline).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {task.assignedTo?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {task.createdBy?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  task.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : task.status === "in-progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : task.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-blue-600 hover:text-blue-900 mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(task._id, "task")}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Edit Task</h3>
            <form onSubmit={handleUpdateTask}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    value={editTaskForm.title}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Deadline</label>
                  <input
                    type="date"
                    value={editTaskForm.deadline}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, deadline: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Assigned To</label>
                  <select
                    value={editTaskForm.assignedTo}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, assignedTo: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select User</option>
                    {users
                      .filter((u) => u.role === "user")
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                  <select
                    value={editTaskForm.status}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea
                    value={editTaskForm.description}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.itemType === "user" ? "User" : "Task"}`}
        message={`Are you sure you want to delete this ${deleteModal.itemType}? This action cannot be undone.`}
      />
    </div>
  )
}

export default AdminDashboard
