const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const userRoutes = require("./routes/UserRoutes")
const taskRoutes = require("./routes/TaskRoutes")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1) // Exit process with failure
  })

// Routes
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)

app.get("/", (req, res) => {
  res.send("Task Management API")
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
