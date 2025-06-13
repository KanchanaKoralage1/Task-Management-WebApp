
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const UserDashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"))
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [searchTerm, statusFilter, sortBy, sortOrder])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get(
        `http://localhost:5000/api/tasks?search=${searchTerm}&status=${statusFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

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

  const handleStatusChange = async (taskId, newStatus) => {
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

  const generatePDF = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get("http://localhost:5000/api/tasks/report", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      })

      const tasks = response.data.data.tasks

      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text("Task Report", 14, 22)

      doc.setFontSize(11)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

      doc.text(`User: ${user.name}`, 14, 38)

      const tableColumn = ["Title", "Description", "Deadline", "Status"]
      const tableRows = []

      tasks.forEach((task) => {
        const taskData = [
          task.title,
          task.description.substring(0, 30) + (task.description.length > 30 ? "..." : ""),
          new Date(task.deadline).toLocaleDateString(),
          task.status,
        ]
        tableRows.push(taskData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 70 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
        },
        headStyles: { fillColor: [66, 139, 202] },
      })

      doc.save(`task-report-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err) {
      console.error("PDF generation error:", err)
      setError("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">My Tasks</h2>

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

              <div className="flex gap-2">
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

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 border rounded-md">
                  <option value="createdAt">Created Date</option>
                  <option value="deadline">Deadline</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>

                <button
                  onClick={generatePDF}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Task List */}
            {loading ? (
              <div className="text-center py-4">Loading tasks...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{task.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.deadline).toLocaleDateString()}
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
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="p-1 border rounded-md text-sm"
                            disabled={task.status === "cancelled"}
                          >
                            <option
                              value="pending"
                              disabled={task.status === "in-progress" || task.status === "completed"}
                            >
                              Pending
                            </option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserDashboard
