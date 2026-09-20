import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../lib/s3.js';
import { randomUUID } from 'crypto';

export const getPresignedUploadUrl = async(fileExtension: string, contentType: string) => {
    const key = `products/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); //Url expira en 5 minutos
    const publicUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${process.env.S3_BUCKET}/${key}`

    return { uploadUrl, key }
};