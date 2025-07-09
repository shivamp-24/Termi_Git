const fs = require("fs").promises;
const path = require("path");

async function revertRepo(targetCommitHash) {
  const repoPath = path.resolve(process.cwd(), ".termi-git");
  const objectsPath = path.join(repoPath, "objects");
  const headPath = path.join(repoPath, "HEAD");

  try {
    const fullCommitHash = await findFullHash(objectsPath, targetCommitHash);
    if (!fullCommitHash) {
      throw new Error(
        `Commit with hash starting '${targetCommitHash}' not found.`
      );
    }

    const targetCommitObject = JSON.parse(
      await fs.readFile(path.join(objectsPath, fullCommitHash), "utf8")
    );
    const targetTreeHash = targetCommitObject.tree;
    const targetTree = JSON.parse(
      await fs.readFile(path.join(objectsPath, targetTreeHash), "utf8")
    );

    let currentTree = {};
    try {
      const currentHeadHash = await fs.readFile(headPath, "utf8");
      const currentCommitObject = JSON.parse(
        await fs.readFile(path.join(objectsPath, currentHeadHash), "utf8")
      );
      const currentTreeHash = currentCommitObject.tree;
      currentTree = JSON.parse(
        await fs.readFile(path.join(objectsPath, currentTreeHash), "utf8")
      );
    } catch (e) {}

    console.log("Cleaning working directory...");
    for (const filePath in currentTree) {
      if (!targetTree[filePath]) {
        console.log(`   Removing ${filePath}`);
        await fs.unlink(path.resolve(process.cwd(), filePath)).catch((err) => {
          if (err.code !== "ENOENT") throw err; // Ignore if file already deleted
        });
      }
    }

    console.log(
      `Checking out files from commit ${fullCommitHash.substring(0, 7)}...`
    );
    for (const filePath in targetTree) {
      const contentHash = targetTree[filePath];
      const fileContent = await fs.readFile(
        path.join(objectsPath, contentHash)
      );
      const fullFilePath = path.resolve(process.cwd(), filePath);

      await fs.mkdir(path.dirname(fullFilePath), { recursive: true });
      await fs.writeFile(fullFilePath, fileContent);
    }

    await fs.writeFile(headPath, fullCommitHash);

    console.log(
      `Successfully reverted. HEAD is now at ${fullCommitHash.substring(0, 7)}.`
    );
  } catch (error) {
    console.error("Error reverting commit:", error.message);
  }
}

async function findFullHash(objectsPath, partialHash) {
  const objectFiles = await fs.readdir(objectsPath);
  for (const file of objectFiles) {
    if (file.startsWith(partialHash)) {
      return file;
    }
  }
  return null;
}

module.exports = { revertRepo };
