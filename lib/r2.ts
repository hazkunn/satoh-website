import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 is S3-compatible. Configuration follows Cloudflare's official
// aws-sdk-js-v3 guide: https://developers.cloudflare.com/r2/examples/aws-sdk-js-v3/
// We intentionally do NOT set forcePathStyle or a custom requestHandler.
// (Forcing path-style + a custom handler previously caused "fetch failed"
// and "SSL alert number 40: handshake_failure" on Vercel's Node serverless
// runtime. The SDK's default Node transport works correctly against R2.)
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your .env.local"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "satoh-website";

/**
 * Upload a file (Buffer) to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return client.send(command);
}

/**
 * Generate a presigned URL for uploading directly from the browser
 * @param key The object key (path in the bucket)
 * @param contentType The MIME type of the file
 * @param expiresIn Seconds until the URL expires (default: 3600 = 1 hour)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading/ viewing a file from R2
 * @param key The object key (path in the bucket)
 * @param expiresIn Seconds until the URL expires (default: 3600 = 1 hour)
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
) {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Get a public URL for an object in R2 (requires public bucket or custom domain)
 * Falls back to presigned URL if no public domain is configured
 */
export function getPublicUrl(key: string) {
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  if (publicDomain) {
    return `https://${publicDomain}/${key}`;
  }
  return null;
}

/**
 * List objects in the bucket with a given prefix
 */
export async function listObjects(prefix: string) {
  const client = getR2Client();
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
  });
  const response = await client.send(command);
  return (response.Contents || []).map((obj) => ({
    key: obj.Key!,
    size: obj.Size!,
    lastModified: obj.LastModified!,
    etag: obj.ETag,
  }));
}

/**
 * Delete an object from R2
 */
export async function deleteFromR2(key: string) {
  const client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return client.send(command);
}