#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init.js");
const { addRepo } = require("./controllers/add.js");
const { commitRepo } = require("./controllers/commit.js");
const { pushRepo } = require("./controllers/push.js");
const { pullRepo } = require("./controllers/pull.js");
const { revertRepo } = require("./controllers/revert.js");
const { logRepo } = require("./controllers/log.js");

console.log("TermiGit CLI");

yargs(hideBin(process.argv))
  .scriptName("termi-git")
  .command(
    "init", // The command name
    "Initialize a repository with an S3 bucket",
    (yargs) => {
      yargs.option("bucket", {
        describe: "The name of the S3 bucket for remote storage",
        type: "string",
        demandOption: true,
        alias: "b",
      });
    },
    initRepo
  )
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files with a message",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command("push", "Push commits to S3 bucket", {}, pushRepo)
  .command("pull", "Pull commits from S3 bucket", {}, pullRepo)
  .command(
    "revert <commitId>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitId", {
        describe: "Commit id to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitId);
    }
  )
  .command("log", "Show the commit history", {}, logRepo)
  .demandCommand(1, "You need at least one command")
  .help()
  .strict().argv;
