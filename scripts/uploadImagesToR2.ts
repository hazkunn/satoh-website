/**
 * Batch-compress and upload images to Cloudflare R2.
 *
 * Reads every image from the local "R2 Storage cloud" folder, runs each
 * through optimizeImage() (resize + WebP), and uploads the result to R2
 * under uploads/<name>.webp (or .png when transparency must be kept).
 *
 * Re-running is safe: it re-uploads and overwrites the same keys.
 *
 * Usage:
 *   npx tsx scripts/uploadImagesToR2.ts            # dry-run (lists what would happen)
 *   npx tsx scripts/uploadImagesToR2.ts --commit    # actually upload
 *
 * See docs/R2_IMAGE_UPLOAD.md for the full picture.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { optimizeImage, isOptimizableImage, swapExtension } from "../lib/imageOptimize";
import { uploadToR2, listObjects } from "../lib/r2";

const SOURCE_DIR = path.join(
  __dirname,
  "..",
  "R2 Storage cloud. DO NOT PUSH AS SERVER DATA. it's for cloud storage"
);
const R2_PREFIX = "uploads";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff", ".bmp"]);

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("⚠️  No .env.local found — R2 upload will fail.");
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

function fmt(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function main() {
  const commit = process.argv.includes("--commit");
  loadEnv();

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source folder not found:\n   ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Collect image files.
  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log("No images found in the source folder.");
    return;
  }

  // Map file extension -> real MIME type (sharp also infers from bytes, but
  // isOptimizableImage() checks the MIME string, so it must be a real one).
  const MIME_BY_EXT: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".tiff": "image/tiff",
    ".bmp": "image/bmp",
  };

  console.log(`\nFound ${files.length} image(s) in:\n  ${SOURCE_DIR}\n`);
  console.log(`Mode: ${commit ? "COMMIT (will upload to R2)" : "DRY-RUN (no uploads; pass --commit to upload)"}\n`);
  console.log(
    `${"file".padEnd(34)} ${"original".padStart(10)}  →  ${"compressed".padStart(10)}  ${"reduction".padStart(9)}  ${"r2 key"}`
  );
  console.log("-".repeat(100));

  let totalOriginal = 0;
  let totalCompressed = 0;
  const plan: { file: string; r2Key: string; buffer: Buffer; contentType: string }[] = [];

  for (const file of files) {
    const src = path.join(SOURCE_DIR, file);
    const original = fs.readFileSync(src);
    const ext = path.extname(file).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || `image/${ext.slice(1)}`;

    if (!isOptimizableImage(contentType)) {
      console.log(`${file.padEnd(34)} ${fmt(original.byteLength).padStart(10)}  →  (not optimizable, skipped)`);
      continue;
    }

    const result = await optimizeImage(original);
    const r2Key = `${R2_PREFIX}/${swapExtension(file, result.ext)}`;
    totalOriginal += original.byteLength;
    totalCompressed += result.buffer.byteLength;

    console.log(
      `${file.padEnd(34)} ${fmt(original.byteLength).padStart(10)}  →  ${fmt(result.buffer.byteLength).padStart(10)}  ${(original.byteLength / result.buffer.byteLength).toFixed(1).padStart(7)}x  ${r2Key}`
    );

    if (commit) plan.push({ file, r2Key, buffer: result.buffer, contentType: result.contentType });
  }

  console.log("-".repeat(100));
  if (totalOriginal > 0) {
    console.log(
      `${"TOTAL".padEnd(34)} ${fmt(totalOriginal).padStart(10)}  →  ${fmt(totalCompressed).padStart(10)}  ${(totalOriginal / totalCompressed).toFixed(1).padStart(7)}x`
    );
  }

  if (!commit) {
    console.log("\nDry-run complete. Re-run with --commit to upload to R2.");
    return;
  }

  // Upload.
  console.log(`\nUploading ${plan.length} file(s) to R2 bucket "${process.env.R2_BUCKET_NAME}"…`);
  for (const item of plan) {
    try {
      await uploadToR2(item.r2Key, item.buffer, item.contentType);
      console.log(`  ✅ ${item.r2Key}  (${fmt(item.buffer.byteLength)})`);
    } catch (e) {
      console.error(`  ❌ ${item.r2Key}  FAILED: ${(e as Error).message}`);
    }
  }

  // Show final bucket listing.
  console.log("\nR2 bucket contents now:");
  try {
    const objects = await listObjects("");
    for (const o of objects) {
      console.log(`   ${o.key.padEnd(45)} ${fmt(o.size)}`);
    }
    if (objects.length === 0) console.log("   (empty)");
  } catch (e) {
    console.error("   Could not list bucket:", (e as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
