const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    //fetch the commits folder from s3
    const data = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: "commits/",
      })
      .promise();

    //retrieve the folders inside
    const objects = data.Contents;

    for (const object of objects) {
      const key = object.Key;
      //find the path of a particular commit inside using key attribute
      const commitDir = path.join(
        commitsPath,
        path.dirname(key).split("/").pop()
      );

      //make the dir to pull files inside
      await fs.mkdir(commitDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      //now pull the file content using params
      const fileContent = await s3.getObject(params).promise();

      //write the file content inside commitDir
      await fs.writeFile(path.join(repoPath, key), fileContent.Body);

      //initial success log
      console.log("Commit pulled from S3");
    }
    //final success log
    console.log("All Commits pulled from S3");
  } catch (error) {
    console.log("Error pulling from s3 : ", error);
  }
}

module.exports = { pullRepo };
