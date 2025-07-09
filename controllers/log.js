const fs = require("fs").promises;
const path = require("path");

async function logRepo() {
  const repoPath = path.resolve(process.cwd(), ".termi-git");
  const objectsPath = path.join(repoPath, "objects");
  const headPath = path.join(repoPath, "HEAD");

  try {
    let currentCommitHash = await fs.readFile(headPath, "utf8");

    console.log("Commit History:");

    while (currentCommitHash) {
      const commitObjectPath = path.join(objectsPath, currentCommitHash);
      const commitObjectContent = await fs.readFile(commitObjectPath, "utf8");
      const commitObject = JSON.parse(commitObjectContent);

      console.log("----------------------------------------");
      console.log(`commit ${currentCommitHash}`);
      console.log(`Author: ${commitObject.author}`);
      console.log(
        `Date:   ${new Date(commitObject.timestamp).toLocaleString()}`
      );
      console.log(`\n    ${commitObject.message}\n`);

      currentCommitHash = commitObject.parent;
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Error: No commits found. Your repository might be empty.");
    } else {
      console.error("An error occurred while reading the log:", error.message);
    }
  }
}

module.exports = { logRepo };
