import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

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
 * R2 only stores DYNAMIC operational data — i.e. stock counts.
 *
 * Static catalog content (name, category, description, models, specifications)
 * lives in the codebase (`lib/inventory.ts`) because it is curated per
 * product-type and rarely changes. Specs for a pump ≠ specs for a bearing,
 * so they must not be forced into a single generic R2 schema.
 */
export const STOCK_KEY = "inventory/stock.json";

export type StockItem = {
  slug: string;
  stock: number;
};

export type StockData = {
  version: number;
  updatedAt: string;
  items: StockItem[];
};

export async function readStockJson(): Promise<StockData> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: STOCK_KEY,
  });
  const response = await client.send(command);
  const body = await response.Body!.transformToString("utf-8");
  return JSON.parse(body) as StockData;
}

export async function writeStockJson(data: StockData): Promise<void> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: STOCK_KEY,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  });
  await client.send(command);
}