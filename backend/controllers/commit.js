const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const stagedPath = path.join(repoPath, "stagingArea");
  const commitPath = path.join(repoPath, "commits");

  try {
    //create a new folder inside commits folder with name same as commitId
    const commitId = uuidv4();
    const commitDir = path.join(commitPath, commitId);
    await fs.mkdir(commitDir, { recursive: true });

    //copy all files from stagingArea to commitId folder
    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    //create a file commit.json inside commitId folder with details of commit message and time of commiting
    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString() })
    );

    console.log(`Commit ${commitId} created with message : ${message}`);
  } catch (error) {
    console.error("Error commiting changes : ", error);
  }
}

module.exports = { commitRepo };
