import { S3Client } from "@aws-sdk/client-s3";
import { error } from "node:console";

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