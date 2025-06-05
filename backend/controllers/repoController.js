const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createRepository = async (req, res) => {
  res.send("Repository created");
};

const getAllRepositories = async (req, res) => {
  res.send("All repositories fetched");
};

const fetchRepositoryById = async (req, res) => {
  res.send("Repository fetched by id");
};

const fetchRepositoryByName = async (req, res) => {
  res.send("Repository fetched by name");
};

const fetchRepositoryForCurrentUser = async (req, res) => {
  res.send("Repository fetched by user id");
};

const toggleVisibilityById = async (req, res) => {
  res.send("Visibility toggled");
};

const updateRepositoryById = async (req, res) => {
  res.send("Repository updated");
};

const deleteRepositoryById = async (req, res) => {
  res.send("Repository deleted");
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
