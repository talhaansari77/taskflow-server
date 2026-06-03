const Task = require("../models/Task");
const Project = require("../models/Project");

const getTasks = async (req, res) => {
  try {
    const { status, priority, project, search } = req.query;

    const query = {
      createdBy: req.user._id,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (project) {
      query.project = project;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    const tasks = await Task.find(query)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, project, priority, status, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        message: "Task title and project are required",
      });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (existingProject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to add task to this project",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      priority,
      status,
      dueDate,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate(
      "project",
      "name"
    );

    return res.status(201).json(populatedTask);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, project, priority, status, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this task",
      });
    }

    if (project) {
      const existingProject = await Project.findById(project);

      if (!existingProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      if (existingProject.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Not authorized to move task to this project",
        });
      }

      task.project = project;
    }

    task.title = title || task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id).populate(
      "project",
      "name"
    );

    return res.status(200).json(populatedTask);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({
      createdBy: req.user._id,
    });

    const completedTasks = await Task.countDocuments({
      createdBy: req.user._id,
      status: "Completed",
    });

    const pendingTasks = await Task.countDocuments({
      createdBy: req.user._id,
      status: "Todo",
    });

    const inProgressTasks = await Task.countDocuments({
      createdBy: req.user._id,
      status: "In Progress",
    });

    return res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};