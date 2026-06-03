const express = require("express");

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, getTaskStats);

router.route("/").get(protect, getTasks).post(protect, createTask);

router.route("/:id").put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;