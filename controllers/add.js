const fs = require("fs").promises;
const path = require("path");
const jsSHA = require("jssha");

async function updateIndex(filePath, contentHash) {
  const indexPath = path.resolve(process.cwd(), ".termi-git", "index.json");
  let index = {};

  try {
    // Read the existing index if it exists
    const indexData = await fs.readFile(indexPath, "utf8");
    index = JSON.parse(indexData);
  } catch (error) {
    // If the index doesn't exist, we start with an empty one.
    if (error.code !== "ENOENT") throw error;
  }

  // Add or update the file's entry in the index
  index[filePath] = contentHash;

  // Write the updated index back to the file
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
}

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".termi-git");
  const objectsPath = path.join(repoPath, "objects");

  try {
    await fs.access(repoPath);
  } catch (error) {
    console.error(
      "Error: Not a TermiGit repository. Run 'termi-git init' first."
    );
    return;
  }

  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const fileContent = await fs.readFile(fullPath);

    const sha = new jsSHA("SHA-1", "ARRAYBUFFER");
    sha.update(fileContent);
    const contentHash = sha.getHash("HEX");

    const objectPath = path.join(objectsPath, contentHash);
    await fs.writeFile(objectPath, fileContent);

    await updateIndex(filePath, contentHash);

    console.log(`Added '${filePath}' to the staging area.`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        `Error: File not found at '${filePath}'. Please check the path.`
      );
    } else {
      console.error("Error adding file:", error.message);
    }
  }
}

module.exports = { addRepo };
