const express = require("express")
const router = express.Router()
const { protect, restrictTo } = require("../middlewares/AuthMiddleware")
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksForReport,
} = require("../controllers/TaskController")

// All routes are protected
router.use(protect)

// Task routes
router.route("/").get(getAllTasks).post(restrictTo("admin"), createTask)

router.route("/report").get(getTasksForReport)

router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask)

module.exports = router
