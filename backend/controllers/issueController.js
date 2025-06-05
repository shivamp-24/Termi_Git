const createIssue = async (req, res) => {
  res.send("Issue created");
};

const getAllIssues = async (req, res) => {
  res.send("All Issues fetched");
};

const getIssueById = async (req, res) => {
  res.send("Issue details fetched");
};

const updateIssueById = async (req, res) => {
  res.send("Issue updated");
};

const deleteIssueById = async (req, res) => {
  res.send("Issue deleted");
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};
