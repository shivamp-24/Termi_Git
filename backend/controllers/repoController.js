const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      res.status(400).json({ error: "Invalid user ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created",
      repositoryId: result._id,
    });
  } catch (error) {
    console.error("Error during repository creation : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getAllRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (error) {
    console.error("Error during fetching repositories : ", error.message);
    res.status(500).send("Server error!");
  }
};

const fetchRepositoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.find({ _id: id })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (error) {
    console.error("Error during fetching repository : ", error.message);
    res.status(500).send("Server error!");
  }
};

const fetchRepositoryByName = async (req, res) => {
  const { name } = req.params;

  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (error) {
    console.error("Error during fetching repository : ", error.message);
    res.status(500).send("Server error!");
  }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
  const userId = req.user;

  try {
    const repositories = await Repository.find({ owner: userId });

    if (!repositories || repositories.length == 0) {
      return res.status(404).json({ error: "User repositories not found" });
    }

    res.json({ message: "Repositories found!", repositories });
  } catch (error) {
    console.error("Error during fetching repositories : ", error.message);
    res.status(500).send("Server error!");
  }
};

const toggleVisibilityById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    console.error("Error during toggling visibility : ", error.message);
    res.status(500).send("Server error!");
  }
};

const updateRepositoryById = async (req, res) => {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    repository.content.push(content);
    repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    console.error("Error during updating repository : ", error.message);
    res.status(500).send("Server error!");
  }
};

const deleteRepositoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findByIdAndDelete(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    res.json({ message: "Repository deleted successfully" });
  } catch (error) {
    console.error("Error during deleting repository : ", error.message);
    res.status(500).send("Server error!");
  }
};

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  toggleVisibilityById,
  updateRepositoryById,
  deleteRepositoryById,
};
