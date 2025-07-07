const express = require("express");
const issueController = require("../controllers/issueController");

const issueRouter = express.Router();

issueRouter.post("/issue/create/:repoId", issueController.createIssue);
issueRouter.get("/issue/all/:repoId", issueController.getAllIssuesForRepo);
issueRouter.get("/issue/:issueId", issueController.getIssueById);
issueRouter.put("/issue/update/:issueId", issueController.updateIssueById);
issueRouter.delete("/issue/delete/:issueId", issueController.deleteIssueById);

module.exports = issueRouter;
