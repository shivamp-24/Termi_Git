const fs = require("fs");
const path = require("path");

//this will check for existence for a folder or file
const { promisify } = require("util");

//update normal readdir and copyFile using promisify to throw error if it doesn't exists
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

async function revertRepo(commitId) {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    //find the commitId folder inside commits folder
    const commitDir = path.join(commitsPath, commitId);

    //read the directory using custom readdir of promisify to get all files
    const files = await readdir(commitDir);

    //find the parentDir i.e., backend folder
    const parentDir = path.resolve(repoPath, "..");

    //copy all files using custom copyFile of promisify from commitDir to parentDir
    for (const file of files) {
      await copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }

    //success log
    console.log(`Commit ${commitId} reverted sucessfully`);
  } catch (error) {
    console.error("Unable to revert : ", error);
  }
}

module.exports = { revertRepo };
