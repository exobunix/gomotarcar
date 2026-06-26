const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const config = require('./env');

let s3Client = null;

const initializeS3 = () => {
  if (s3Client) return s3Client;

  const clientConfig = {
    region: config.s3Region,
    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey,
    },
  };

  if (config.s3Endpoint) {
    clientConfig.endpoint = config.s3Endpoint;
    clientConfig.forcePathStyle = true;
  }

  s3Client = new S3Client(clientConfig);
  console.log('S3 client initialized');
  return s3Client;
};

const getS3 = () => s3Client;
const getBucket = () => config.s3Bucket;

module.exports = { initializeS3, getS3, getBucket, Upload };
