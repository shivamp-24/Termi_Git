const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createIssue = async (req, res) => {
  const { repoId } = req.params;
  const { title, description } = req.body;

  try {
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ error: "Invalid repository ID format." });
    }

    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found." });
    }

    const newIssue = new Issue({
      title,
      description,
      repository: repoId, // Link the issue to the repository
    });

    const savedIssue = await newIssue.save();

    repository.issues.push(savedIssue._id);
    await repository.save();

    res
      .status(201)
      .json({ message: "Issue created successfully", issue: savedIssue });
  } catch (error) {
    console.error("Error during issue creation : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getAllIssuesForRepo = async (req, res) => {
  const { repoId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({ error: "Invalid repository ID format." });
    }

    const issues = await Issue.find({ repository: repoId });

    res.status(200).json(issues);
  } catch (error) {
    console.error("Error during issue fetching : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getIssueById = async (req, res) => {
  const { issueId } = req.params;

  try {
    const issue = await Issue.findById(issueId).populate(
      "repository",
      "name owner"
    );

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Error fetching issue: ", error.message);
    res.status(500).send("Server error!");
  }
};

const updateIssueById = async (req, res) => {
  const { issueId } = req.params;
  const { title, description, status } = req.body;

  try {
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (status) {
      if (["open", "closed"].includes(status)) {
        updateData.status = status;
      } else {
        return res
          .status(400)
          .json({ error: "Invalid status. Must be 'open' or 'closed'." });
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json({ message: "Issue updated successfully", issue: updatedIssue });
  } catch (error) {
    console.error("Error during issue updation : ", error.message);
    res.status(500).send("Server error!");
  }
};

const deleteIssueById = async (req, res) => {
  const { issueId } = req.params;

  try {
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    await Repository.findByIdAndUpdate(issue.repository, {
      $pull: { issues: issue._id },
    });

    await issue.deleteOne();

    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error during issue deletion : ", error.message);
    res.status(500).send("Server error!");
  }
};

module.exports = {
  createIssue,
  getAllIssuesForRepo,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};
