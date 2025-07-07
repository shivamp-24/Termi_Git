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

    const savedRepository = await newRepository.save();

    await User.findByIdAndUpdate(owner, {
      $push: { repositories: savedRepository._id },
    });

    res.status(201).json({
      message: "Repository created",
      repository: savedRepository,
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
    const repository = await Repository.findById(id)
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
    const repository = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (error) {
    console.error("Error during fetching repository : ", error.message);
    res.status(500).send("Server error!");
  }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
  const userId = req.params.userID;

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
  const { description } = req.body;

  try {
    const updateData = {};
    if (description) updateData.description = description;

    const updatedRepository = await Repository.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRepository) {
      return res.status(404).json({ error: "Repository not found" });
    }

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
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // 1. Delete all associated issues to prevent orphaned documents.
    await Issue.deleteMany({ repository: repository._id });

    // 2. Remove the repository's ID from its owner's list.
    await User.findByIdAndUpdate(repository.owner, {
      $pull: { repositories: repository._id },
    });

    // 3. Remove from any user's starRepos list.
    await User.updateMany(
      { starRepos: repository._id },
      { $pull: { starRepos: repository._id } }
    );
    
    // 4. Finally, delete the repository itself.
    await repository.deleteOne();

    res.json({ message: "Repository and all associated data deleted successfully" });
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
