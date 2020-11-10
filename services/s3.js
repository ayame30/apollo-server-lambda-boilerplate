import AWS from 'aws-sdk';
import parseS3Url from 'amazon-s3-uri';

const {
  AWS_S3_REGION,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_UGC_BUCKET } = process.env;


const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: AWS_S3_REGION,
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
});

export default{
  upload: (params) => new Promise((resolve, reject) => {
    s3.upload({ ...params, Bucket: AWS_S3_UGC_BUCKET }, function(err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }),
  getPresignedUrl: (params) => new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', { ...params, Bucket: AWS_S3_UGC_BUCKET }, (error, url) => {
      if (error) return reject(error);
      resolve(url);
    })
  }),
  getObject: async ({ Bucket, Key, uri }) => {
    if (uri) {
      const { region, bucket, key } = parseS3Url(uri);
      return s3.getObject({Bucket: bucket, Key: key}).promise();
    }
    return s3.getObject({ Bucket, Key }).promise();
  }
};
