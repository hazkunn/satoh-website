/**
 * End-to-end PROOF that image compression + R2 upload works.
 *
 * What this does, step by step, leaving real artifacts behind:
 *   1. Loads .env.local (R2 credentials).
 *   2. Builds a large JPEG (~10MB, simulating an 8-11MB phone photo) and
 *      SAVES it to disk  -> scripts/sample-original.jpg
 *   3. Runs it through optimizeImage() and SAVES the result to disk
 *      -> scripts/sample-compressed.webp
 *   4. Lists what's currently in the R2 bucket (before).
 *   5. Uploads the COMPRESSED file to R2 -> uploads/proof-sample.webp
 *   6. Lists the bucket again (after) so you can SEE the new object + its size.
 *
 * Run with:  npx tsx scripts/proofImageUpload.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";
import { optimizeImage } from "../lib/imageOptimize";
import { uploadToR2, listObjects } from "../lib/r2";

// 1. Load .env.local so R2 credentials are available.
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
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
    console.log("✅ Loaded .env.local");
  } else {
    console.log("⚠️  No .env.local found");
  }
}

async function main() {
  loadEnv();

  const outDir = __dirname;
  const originalPath = path.join(outDir, "sample-original.jpg");
  const compressedPath = path.join(outDir, "sample-compressed.webp");

  // 2. Build a big image (4000x3000) and SAVE it to disk.
  console.log("\n=== STEP 1: Create a large original JPEG on disk ===");
  const W = 4000;
  const H = 3000;
  const channels = 3;
  const raw = Buffer.alloc(W * H * channels);
  for (let i = 0; i < raw.length; i += channels) {
    const v = (Math.sin(i * 0.013) * 127 + 128) & 0xff;
    raw[i] = v ^ ((i * 7) & 0xff);
    raw[i + 1] = v ^ ((i * 13) & 0xff);
    raw[i + 2] = v ^ ((i * 29) & 0xff);
  }
  const originalJpeg = await sharp(raw, {
    raw: { width: W, height: H, channels },
  })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(originalPath, originalJpeg);
  console.log(`✅ Saved original  -> ${originalPath}`);
  console.log(`   Size: ${(originalJpeg.byteLength / (1024 * 1024)).toFixed(2)} MB`);

  // 3. Compress it and SAVE the result to disk.
  console.log("\n=== STEP 2: Compress and save to disk ===");
  const result = await optimizeImage(originalJpeg);
  fs.writeFileSync(compressedPath, result.buffer);
  const meta = await sharp(result.buffer).metadata();
  console.log(`✅ Saved compressed-> ${compressedPath}`);
  console.log(`   Size: ${(result.buffer.byteLength / 1024).toFixed(0)} KB`);
  console.log(`   Format: ${result.contentType}  Dimensions: ${meta.width}x${meta.height}`);
  console.log(`   Reduction: ${(originalJpeg.byteLength / result.buffer.byteLength).toFixed(1)}x smaller`);

  // 4. List bucket BEFORE.
  console.log("\n=== STEP 3: R2 bucket contents (BEFORE upload) ===");
  let before: { key: string; size: number }[] = [];
  try {
    before = await listObjects("");
    for (const o of before) {
      console.log(`   ${o.key}  (${(o.size / 1024).toFixed(1)} KB)`);
    }
    if (before.length === 0) console.log("   (empty)");
  } catch (e) {
    console.error("   Could not list bucket:", (e as Error).message);
  }

  // 5. Upload the COMPRESSED file to R2.
  console.log("\n=== STEP 4: Upload compressed file to R2 ===");
  const r2Key = "uploads/proof-sample.webp";
  try {
    await uploadToR2(r2Key, result.buffer, result.contentType);
    console.log(`✅ Uploaded to R2 as: ${r2Key}`);
  } catch (e) {
    console.error("❌ Upload to R2 failed:", (e as Error).message);
    process.exit(1);
  }

  // 6. List bucket AFTER.
  console.log("\n=== STEP 5: R2 bucket contents (AFTER upload) ===");
  try {
    const after = await listObjects("");
    for (const o of after) {
      const tag = before.find((b) => b.key === o.key) ? "(existing)" : "(NEW ✨)";
      console.log(`   ${o.key}  (${(o.size / 1024).toFixed(1)} KB)  ${tag}`);
    }
    if (after.length === 0) console.log("   (empty)");
  } catch (e) {
    console.error("   Could not list bucket after:", (e as Error).message);
  }

  console.log("\n=== DONE ===");
  console.log(`Open these files on disk to compare with your own eyes:`);
  console.log(`  ${originalPath}`);
  console.log(`  ${compressedPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
