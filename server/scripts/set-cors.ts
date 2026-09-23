import 'dotenv/config';
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable ${key}`);
    return value
}

export const s3 = new S3Client({
    endpoint: requireEnv('AWS_ENDPOINT_URL_S3'),
    region: requireEnv('AWS_REGION'),
    credentials: {
        accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY')
    },
    forcePathStyle: true,
});

async function setCors() {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [
              'http://localhost:5173',                          // local dev
              'https://alimentatec-admin.onrender.com',         // deployed frontend
            ],
            AllowedMethods: ['PUT', 'GET'],
            AllowedHeaders: ['*'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );

  console.log('CORS configuration applied successfully.');
}

setCors().catch(console.error);