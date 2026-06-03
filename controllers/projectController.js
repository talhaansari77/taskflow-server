const Project = require("../models/Project");

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this project",
      });
    }

    project.name = name || project.name;
    project.description =
      description !== undefined ? description : project.description;

    const updatedProject = await project.save();

    return res.status(200).json(updatedProject);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this project",
      });
    }

    await project.deleteOne();

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};