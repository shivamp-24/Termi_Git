const fs = require("fs").promises;
const path = require("path");
const jsSHA = require("jssha");
const os = require("os");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".termi-git");
  const objectsPath = path.join(repoPath, "objects");
  const indexPath = path.join(repoPath, "index.json");
  const headPath = path.join(repoPath, "HEAD");

  try {
    await fs.access(repoPath);
  } catch (error) {
    console.error(
      "Error: Not a TermiGit repository. Run 'termi-git init' first."
    );
    return;
  }

  try {
    const indexData = await fs.readFile(indexPath, "utf8");
    const index = JSON.parse(indexData);

    if (Object.keys(index).length === 0) {
      console.log("Nothing to commit, staging area is empty.");
      return;
    }

    const treeContent = JSON.stringify(index, null, 2);
    const sha = new jsSHA("SHA-1", "TEXT");
    sha.update(treeContent);
    const treeHash = sha.getHash("HEX");

    await fs.writeFile(path.join(objectsPath, treeHash), treeContent);

    let parentCommitHash = null;
    try {
      parentCommitHash = await fs.readFile(headPath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    const commitObject = {
      tree: treeHash,
      parent: parentCommitHash,
      author: os.userInfo().username,
      message: message,
      timestamp: new Date().toISOString(),
    };

    const commitContent = JSON.stringify(commitObject, null, 2);
    const commitSha = new jsSHA("SHA-1", "TEXT");
    commitSha.update(commitContent);
    const commitHash = commitSha.getHash("HEX");

    await fs.writeFile(path.join(objectsPath, commitHash), commitContent);

    await fs.writeFile(headPath, commitHash);

    await fs.unlink(indexPath);

    console.log(`Committed successfully!`);
    console.log(`[${commitHash.substring(0, 7)}] ${message}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "Nothing to commit. Have you added any files with 'termi-git add'?"
      );
    } else {
      console.error("Error committing changes:", error.message);
    }
  }
}

module.exports = { commitRepo };
