import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

interface S3Metadata {
  documentId: string;
  conversationId: string;
  userId: string;
}

if (!process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
  throw new Error("Missing MinIO credentials in environment variables");
}

export const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
});

export async function storeFileInS3(
  file: Express.Multer.File,
  metadata: S3Metadata
) {
  try {
    const s3Key = `pdf/${metadata.documentId}`;

    const command = new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        "user-id": metadata.userId,
        "document-id": metadata.documentId,
        "conversation-id": metadata.conversationId,
      },
    });

    await s3Client.send(command);
    return s3Key;
  } catch (error) {
    console.error("Failed to upload file to S3:", error);

    if (error instanceof Error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    } else {
      throw new Error("S3 upload failed: Unknown error");
    }
  }
}
