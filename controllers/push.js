const fs = require("fs").promises;
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("../utils/aws-config.js");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".termi-git");
  const objectsPath = path.join(repoPath, "objects");
  const configPath = path.join(repoPath, "config.json");
  const headPath = path.join(repoPath, "HEAD");

  try {
    const configData = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configData);
    const { s3Bucket } = config;

    if (!s3Bucket) {
      throw new Error("S3 bucket not configured. Run 'termi-git init' again.");
    }

    const s3Client = getS3Client();

    console.log("Enumerating objects to push...");
    const objectHashes = await fs.readdir(objectsPath);
    console.log(`Found ${objectHashes.length} objects.`);

    for (const hash of objectHashes) {
      const objectFilePath = path.join(objectsPath, hash);
      const fileContent = await fs.readFile(objectFilePath);

      const params = {
        Bucket: s3Bucket,
        Key: `objects/${hash}`,
        Body: fileContent,
      };

      await s3Client.send(new PutObjectCommand(params));
    }
    console.log("All local objects uploaded successfully.");

    console.log("Updating remote HEAD...");
    const headHash = await fs.readFile(headPath, "utf8");
    const headParams = {
      Bucket: s3Bucket,
      Key: "HEAD",
      Body: headHash,
    };
    await s3Client.send(new PutObjectCommand(headParams));

    console.log("Push complete. Your remote is up-to-date.");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "Error: Not a TermiGit repository or no commits found. Run 'termi-git init' and 'termi-git commit' first."
      );
    } else {
      console.error("An error occurred while pushing to S3:", error.message);
    }
  }
}

module.exports = { pushRepo };
