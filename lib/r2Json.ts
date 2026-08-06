import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";

const NoSuchKeyErrorNames = new Set(["NoSuchKey", "NotFound"]);

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
    forcePathStyle: true,
    requestHandler: new FetchHttpHandler({ keepAlive: false }),
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
 *
 * Stock is stored PER-MODE (slug + model code) so that e.g.
 * "mitsuboshi-v-belt-a" / "A19" has its own stock count.
 * This shape MUST stay in sync with lib/localStock.ts.
 */
export const STOCK_KEY = "inventory/stock.json";

export type StockItem = {
  slug: string;
  model: string;
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

  let body: string;
  try {
    const response = await client.send(command);
    body = await response.Body!.transformToString("utf-8");
  } catch (err: unknown) {
    // If the object doesn't exist yet, return an empty stock document
    // instead of crashing the API. This lets the app boot cleanly on a
    // fresh R2 bucket before any stock has been seeded.
    const name = (err as { name?: string; Code?: string }).name ?? (err as { Code?: string }).Code;
    if (name && NoSuchKeyErrorNames.has(name)) {
      return { version: 2, updatedAt: new Date().toISOString(), items: [] };
    }
    throw err;
  }

  const parsed = JSON.parse(body) as StockData;
  // Normalize v1 (slug-only) → v2 by defaulting missing model to ""
  if (parsed.version < 2 || !parsed.items.every((i) => "model" in i)) {
    parsed.version = 2;
    parsed.items = parsed.items.map((i) => ({
      slug: i.slug,
      model: (i as { model?: string }).model ?? "",
      stock: i.stock,
    }));
  }
  return parsed;
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