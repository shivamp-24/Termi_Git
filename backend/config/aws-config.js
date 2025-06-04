require("dotenv").config()

const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const S3_BUCKET = "bucketshivamdeepu";

module.exports = { s3, S3_BUCKET };