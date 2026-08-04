/**
 * Push script: Upload data/stock.json → R2 (with read-back verification)
 *
 * R2 stores the DYNAMIC operational data (per-model stock counts).
 * This script reads the local data/stock.json (produced by seedStock50.ts
 * or seedInventory.ts) and uploads it to R2 at inventory/stock.json,
 * then reads it back to confirm integrity.
 *
 * Usage:
 *   npx tsx scripts/pushStockToR2.ts            # reads data/stock.json
 *   npx tsx scripts/pushStockToR2.ts <file>     # reads a custom file
 *
 * Requires R2 credentials in .env.local:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {
  writeStockJson,
  readStockJson,
  type StockData,
} from "../lib/r2Json";

// Minimal .env.local loader — avoids adding the dotenv dependency.
// Next.js loads .env.local automatically for the app, but standalone
// tsx scripts need to populate process.env themselves.
function loadEnvLocal(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf-8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal(path.join(process.cwd(), ".env.local"));

async function main() {
  const arg = process.argv[2];
  const inputPath = arg || path.join(process.cwd(), "data", "stock.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.error("   Run `npx tsx scripts/seedStock50.ts` first to generate it.");
    process.exit(1);
  }

  // ── Load & validate local file ───────────────────────────────────
  const raw = fs.readFileSync(inputPath, "utf-8");
  let data: StockData;
  try {
    data = JSON.parse(raw) as StockData;
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    process.exit(1);
  }

  if (!Array.isArray(data.items)) {
    console.error("❌ Invalid stock data: missing 'items' array.");
    process.exit(1);
  }

  // Ensure every item has a model field (normalize v1 → v2 just in case)
  data.version = 2;
  data.items = data.items.map((i) => ({
    slug: i.slug,
    model: (i as { model?: string }).model ?? "",
    stock: i.stock,
  }));

  const localHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");

  console.log(`📦 Loaded: ${inputPath}`);
  console.log(`   items:  ${data.items.length}`);
  console.log(`   version: ${data.version}`);
  console.log(`   updatedAt: ${data.updatedAt}`);
  console.log(`   sha256(local): ${localHash.slice(0, 16)}…`);

  // Sanity: count distinct slugs
  const slugSet = new Set(data.items.map((i) => i.slug));
  console.log(`   distinct slugs: ${slugSet.size}`);

  // ── Upload to R2 ─────────────────────────────────────────────────
  console.log("\n⬆️  Uploading to R2…");
  const t0 = Date.now();
  await writeStockJson(data);
  console.log(`   ✅ Uploaded in ${Date.now() - t0}ms → ${process.env.R2_BUCKET_NAME}/inventory/stock.json`);

  // ── Read back & verify ───────────────────────────────────────────
  console.log("\n⬇️  Reading back from R2 to verify…");
  const t1 = Date.now();
  const readback = await readStockJson();
  console.log(`   ✅ Read back in ${Date.now() - t1}ms`);
  console.log(`   items:  ${readback.items.length}`);

  // Compare by a normalized key set (updatedAt may differ if R2 rewrites)
  const localKeys = data.items
    .map((i) => `${i.slug}|${i.model}|${i.stock}`)
    .sort()
    .join("\n");
  const remoteKeys = readback.items
    .map((i) => `${i.slug}|${i.model}|${i.stock}`)
    .sort()
    .join("\n");

  if (localKeys === remoteKeys) {
    console.log("\n🎉 Verification PASSED — R2 content matches local file.");
    console.log(`   ${data.items.length} stock items live in R2.`);
  } else {
    console.error("\n❌ Verification FAILED — R2 content does NOT match local file.");
    // Show first divergence for debugging
    const localLines = localKeys.split("\n");
    const remoteLines = remoteKeys.split("\n");
    const maxLen = Math.max(localLines.length, remoteLines.length);
    let diverged = false;
    for (let i = 0; i < maxLen && !diverged; i++) {
      if (localLines[i] !== remoteLines[i]) {
        console.error(`   First diff at index ${i}:`);
        console.error(`   local : ${localLines[i] ?? "(none)"}`);
        console.error(`   remote: ${remoteLines[i] ?? "(none)"}`);
        diverged = true;
      }
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Push failed:", err);
  process.exit(1);
});