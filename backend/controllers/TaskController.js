const Task = require("../models/Task")
const User = require("../models/User")

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const query = {}

    // If user is not admin, only show tasks assigned to them
    if (req.user.role !== "admin") {
      query.assignedTo = req.user._id
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Status filter
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status
    }

    // Sort functionality
    const sortOptions = {}
    if (req.query.sortBy) {
      sortOptions[req.query.sortBy] = req.query.sortOrder === "desc" ? -1 : 1
    } else {
      sortOptions.createdAt = -1 // Default sort by creation date (newest first)
    }

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email").populate("createdBy", "name")

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    // Check if user is authorized to view this task
    if (req.user.role !== "admin" && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to view this task",
      })
    }

    res.status(200).json({
      status: "success",
      data: { task },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo, status } = req.body

    // Check if assigned user exists
    const user = await User.findById(assignedTo)
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Assigned user not found",
      })
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      assignedTo,
      status: status || "pending",
      createdBy: req.user._id,
    })

    res.status(201).json({
      status: "success",
      data: { task },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo, status } = req.body

    // Check if task exists
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    // Check if user is authorized to update this task
    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this task",
      })
    }

    // If assignedTo is being updated, check if user exists
    if (assignedTo) {
      const user = await User.findById(assignedTo)
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Assigned user not found",
        })
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        deadline,
        assignedTo,
        status,
      },
      { new: true, runValidators: true },
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")

    res.status(200).json({
      status: "success",
      data: { task: updatedTask },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    // Check if user is authorized to delete this task
    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete this task",
      })
    }

    await Task.findByIdAndDelete(req.params.id)

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

// Get tasks for PDF report
exports.getTasksForReport = async (req, res) => {
  try {
    const query = {}

    // If user is not admin, only show tasks assigned to them
    if (req.user.role !== "admin") {
      query.assignedTo = req.user._id
    }

    // Status filter for report
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status
    }

    const tasks = await Task.find(query)
      .sort({ deadline: 1 }) // Sort by deadline for reports
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}
