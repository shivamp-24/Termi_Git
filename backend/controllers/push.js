const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    //we will read all the folders inside commits folder
    const commitDirs = await fs.readdir(commitsPath);

    //now loop through each folder to read all files inside each commit
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      //loop through each file inside commitDir
      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        //define params to push to s3
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`,
          Body: fileContent,
        };

        //upload to S3
        await s3.upload(params).promise();
      }
    }

    //success
    console.log("All Commits pushed to S3");
  } catch (error) {
    console.error("Error pushing to S3 : ", error);
  }
}

module.exports = { pushRepo };
