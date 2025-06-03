const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const stagedPath = path.join(repoPath, "stagingArea");

  try {
    //creating stagingArea folder
    await fs.mkdir(stagedPath, { recursive: true });

    //extracting filename and then copying the file received in argument from source destination to stagingArea
    const fileName = path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagedPath, fileName));

    //success log
    console.log(`File ${fileName} has been added to the staging area`);
  } catch (error) {
    console.error("Error adding file : ", error);
  }
}

module.exports = { addRepo };
