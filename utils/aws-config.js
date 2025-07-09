const { S3Client } = require("@aws-sdk/client-s3");

function getS3Client() {
  const clientConfig = {};

  if (!process.env.AWS_REGION) {
    clientConfig.region = "ap-south-1";
  }

  const s3Client = new S3Client(clientConfig);
  return s3Client;
}

module.exports = { getS3Client };
