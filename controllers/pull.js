const fs = require("fs").promises;
const path = require("path");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getS3Client } = require("../utils/aws-config.js");

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".termi-git");
  const objectsPath = path.join(repoPath, "objects");
  const configPath = path.join(repoPath, "config.json");
  const headPath = path.join(repoPath, "HEAD");

  try {
    const configData = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configData);
    const { s3Bucket } = config;
    if (!s3Bucket) throw new Error("S3 bucket not configured.");

    const s3Client = getS3Client();

    console.log("Fetching remote HEAD...");
    const headObject = await s3Client.send(
      new GetObjectCommand({ Bucket: s3Bucket, Key: "HEAD" })
    );
    const remoteHeadHash = await streamToString(headObject.Body);
    console.log(`Remote HEAD is at commit: ${remoteHeadHash.substring(0, 7)}`);

    await fetchObject(remoteHeadHash, s3Client, s3Bucket, objectsPath);

    console.log("Checking out files from the latest commit...");
    const commitObjectContent = await fs.readFile(
      path.join(objectsPath, remoteHeadHash),
      "utf8"
    );
    const commitObject = JSON.parse(commitObjectContent);
    const treeHash = commitObject.tree;

    const treeObjectContent = await fs.readFile(
      path.join(objectsPath, treeHash),
      "utf8"
    );
    const tree = JSON.parse(treeObjectContent);

    for (const filePath in tree) {
      const contentHash = tree[filePath];
      const fileContent = await fs.readFile(
        path.join(objectsPath, contentHash)
      );
      const fullFilePath = path.resolve(process.cwd(), filePath);

      await fs.mkdir(path.dirname(fullFilePath), { recursive: true });
      await fs.writeFile(fullFilePath, fileContent);
    }

    await fs.writeFile(headPath, remoteHeadHash);

    console.log("Pull complete. Your local repository is up-to-date.");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "Error: Not a TermiGit repository. Run 'termi-git init' first."
      );
    } else if (error.name === "NoSuchKey") {
      console.error(
        "Error: Remote repository seems empty or 'HEAD' is missing. Have you pushed yet?"
      );
    } else {
      console.error("An error occurred while pulling from S3:", error.message);
    }
  }
}

async function fetchObject(hash, s3Client, bucket, objectsPath) {
  const objectPath = path.join(objectsPath, hash);

  try {
    await fs.access(objectPath);
    return;
  } catch (error) {}

  console.log(`   Fetching object: ${hash}`);
  const objectData = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: `objects/${hash}` })
  );
  const content = await streamToString(objectData.Body);

  await fs.writeFile(objectPath, content);

  try {
    const parsedContent = JSON.parse(content);
    if (parsedContent.tree) {
      await fetchObject(parsedContent.tree, s3Client, bucket, objectsPath);
    } else {
      for (const fileName in parsedContent) {
        await fetchObject(
          parsedContent[fileName],
          s3Client,
          bucket,
          objectsPath
        );
      }
    }
  } catch (e) {}
}

module.exports = { pullRepo };
