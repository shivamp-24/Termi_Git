const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createIssue = async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  try {
    const issue = new Issue({
      title,
      description,
      repository: id,
    });

    await issue.save();

    res.status(201).json(issue);
  } catch (error) {
    console.error("Error during issue creation : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getAllIssues = async (req, res) => {
  const { id } = req.params;

  try {
    const issues = Issue.find({ repository: id });

    if (!issues) {
      return res.status(404).json({ error: "Issues not found!" });
    }

    res.status(200).json(issues);
  } catch (error) {
    console.error("Error during issue fetching : ", error.message);
    res.status(500).send("Server error!");
  }
};

const getIssueById = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json({ message: "Issue Fetched!", issue });
  } catch (error) {
    console.error("Error during issue updation : ", error.message);
    res.status(500).send("Server error!");
  }
};

const updateIssueById = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();

    res.json({ message: "Issue Updated!", issue });
  } catch (error) {
    console.error("Error during issue updation : ", error.message);
    res.status(500).send("Server error!");
  }
};

const deleteIssueById = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "issue not found!" });
    }

    res.json({ message: "Issue Deleted!" });
  } catch (error) {
    console.error("Error during issue deletion : ", error.message);
    res.status(500).send("Server error!");
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};
