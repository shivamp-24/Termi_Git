const fs = require("fs").promises;
const path = require("path");

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    //creating .myGit folder, and inside .myGit folder => create commits folder
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });

    //creating config.json inside .myGit folder
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: process.env.S3_BUCKET })
    );

    //success log
    console.log("Repository initialized!");
  } catch (error) {
    console.error("Error initializing the repository : ", error);
  }
}

module.exports = { initRepo };
