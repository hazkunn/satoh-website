/**
 * Seed script: Initialize all product models to stock = 50
 *
 * Reads the static catalog (lib/inventory.ts) to enumerate every
 * product slug + model code, then writes them to data/stock.json
 * with stock = 50 each.
 *
 * Usage:
 *   npx tsx scripts/seedStock50.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  getProductSlugsWithModels,
  getModelCodesForSlug,
  getItemSlugs,
} from "../lib/inventory";
import type { StockData, StockItem } from "../lib/localStock";

const DEFAULT_STOCK = 50;

async function main() {
  const items: StockItem[] = [];

  // Products with models — each model gets its own stock entry
  const slugsWithModels = getProductSlugsWithModels();
  for (const slug of slugsWithModels) {
    const modelCodes = getModelCodesForSlug(slug);
    for (const model of modelCodes) {
      items.push({ slug, model, stock: DEFAULT_STOCK });
    }
    console.log(`  ${slug}: ${modelCodes.length} models → stock ${DEFAULT_STOCK}`);
  }

  // Products without models — single entry with model = ""
  const allSlugs = getItemSlugs();
  for (const slug of allSlugs) {
    if (!slugsWithModels.includes(slug)) {
      items.push({ slug, model: "", stock: DEFAULT_STOCK });
      console.log(`  ${slug}: no models → stock ${DEFAULT_STOCK}`);
    }
  }

  const data: StockData = {
    version: 2,
    updatedAt: new Date().toISOString(),
    items,
  };

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outFile = path.join(dataDir, "stock.json");
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`\n✅ Seeded ${items.length} stock items to ${outFile}`);
  console.log(`   All models set to stock = ${DEFAULT_STOCK}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});