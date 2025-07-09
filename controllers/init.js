const fs = require("fs").promises;
const path = require("path");
const { HeadBucketCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("../utils/aws-config.js");

async function initRepo(argv) {
  const bucketName = argv.bucket;

  if (!bucketName) {
    console.error("Error: S3 bucket name is required.");
    console.log("Usage: termi-git init --bucket <your-s3-bucket-name>");
    return;
  }

  const repoPath = path.resolve(process.cwd(), ".termi-git");

  try {
    await fs.access(repoPath);
    console.log("This directory is already a TermiGit repository.");
    return;
  } catch (error) {}

  try {
    console.log(`Verifying access to S3 bucket: "${bucketName}"...`);
    const s3Client = getS3Client();
    const headBucketParams = { Bucket: bucketName };
    await s3Client.send(new HeadBucketCommand(headBucketParams));
    console.log("Bucket found and accessible.");

    console.log(`Initializing repository for S3 bucket: "${bucketName}"...`);

    const objectsPath = path.join(repoPath, "objects");
    const configPath = path.join(repoPath, "config.json");

    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(objectsPath, { recursive: true });

    const config = {
      s3Bucket: bucketName,
      region: process.env.AWS_REGION || "ap-south-1",
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    console.log("Repository initialized successfully!");
    console.log("\nNext steps:");
    console.log("  1. Add files using: termi-git add <file-path>");
    console.log('  2. Commit them using: termi-git commit "Your message"');
  } catch (error) {
    if (error.name === "NotFound") {
      console.error(`Error: The bucket "${bucketName}" does not exist.`);
    } else if (error.name === "Forbidden") {
      console.error(
        `Error: Access denied. You do not have permission to access the bucket "${bucketName}".`
      );
    } else {
      console.error(
        "An error occurred while trying to access the S3 bucket:",
        error.message
      );
    }
    console.log(
      "\nPlease ensure the bucket exists, your credentials are correct, and you have the necessary permissions."
    );
  }
}

module.exports = { initRepo };
