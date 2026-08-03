/**
 * Seed script: Convert Excel/CSV stock data → stock.json → R2
 *
 * R2 only stores DYNAMIC operational data (stock counts).
 * Static catalog content (name, category, description, models, specs)
 * lives in the codebase (`lib/inventory.ts`).
 *
 * Expected file format (Excel .xlsx or .csv):
 *   Columns: slug | stock
 *   - slug:  product slug (must match a slug from lib/inventory.ts)
 *   - stock: integer
 *
 * Usage:
 *   npx tsx scripts/seedInventory.ts <input.xlsx|input.csv>
 *
 * If no argument given, looks for scripts/stock.xlsx or scripts/stock.csv
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { writeStockJson, type StockData, type StockItem } from "../lib/r2Json";
import { getItemSlugs } from "../lib/inventory";

// ── Excel reading ────────────────────────────────────────────────
type RawRow = {
  slug: string;
  stock: string;
};

async function readExcel(filePath: string): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const rows: RawRow[] = [];
  const headers: string[] = [];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "").trim().toLowerCase();
  });

  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      const cell = row.getCell(i + 1);
      obj[h] = String(cell.value ?? "").trim();
    });
    if (!obj.slug) continue;
    rows.push({
      slug: obj.slug,
      stock: obj.stock || "0",
    });
  }
  return rows;
}

function readCsv(filePath: string): RawRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return records
    .filter((r) => r.slug)
    .map((r) => ({
      slug: r.slug,
      stock: r.stock || "0",
    }));
}

// ── build stock items ────────────────────────────────────────────
function buildStockItems(rows: RawRow[]): StockItem[] {
  const knownSlugs = new Set(getItemSlugs());
  const items: StockItem[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);

    if (!knownSlugs.has(row.slug)) {
      console.warn(`⚠️  Slug "${row.slug}" not found in static catalog — skipping.`);
      continue;
    }

    items.push({
      slug: row.slug,
      stock: parseInt(row.stock, 10) || 0,
    });
  }

  return items;
}

// ── main ─────────────────────────────────────────────────────────
async function main() {
  const arg = process.argv[2];
  let inputPath = arg;

  if (!inputPath) {
    const candidates = [
      "scripts/stock.xlsx",
      "scripts/stock.csv",
      "stock.xlsx",
      "stock.csv",
    ];
    inputPath = candidates.find((c) => fs.existsSync(c)) || "";
  }

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error(
      "Usage: npx tsx scripts/seedInventory.ts <input.xlsx|input.csv>"
    );
    console.error("No input file found.");
    process.exit(1);
  }

  console.log(`Reading: ${inputPath}`);
  const ext = path.extname(inputPath).toLowerCase();
  let rows: RawRow[];

  if (ext === ".xlsx" || ext === ".xls") {
    rows = await readExcel(inputPath);
  } else if (ext === ".csv") {
    rows = readCsv(inputPath);
  } else {
    console.error(`Unsupported file type: ${ext}`);
    process.exit(1);
  }

  console.log(`Parsed ${rows.length} rows.`);

  const items = buildStockItems(rows);
  console.log(`Built ${items.length} stock items.`);

  const data: StockData = {
    version: 1,
    updatedAt: new Date().toISOString(),
    items,
  };

  // Write local copy for debugging
  const localOut = path.join(
    path.dirname(inputPath),
    "stock.json"
  );
  fs.writeFileSync(localOut, JSON.stringify(data, null, 2));
  console.log(`Wrote local copy: ${localOut}`);

  // Upload to R2
  console.log("Uploading to R2...");
  await writeStockJson(data);
  console.log("✅ Upload complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});