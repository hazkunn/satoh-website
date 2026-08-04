import "server-only";
import * as fs from "node:fs";
import * as path from "node:path";

// ============================================================
// Local stock storage — replaces R2 during local development
// ============================================================
// Stock is stored PER-MODE (slug + model code) so that e.g.
// "mitsuboshi-v-belt-a" / "A19" has its own stock count.
//
// When ready for production, swap this module's read/write calls
// with lib/r2Json.ts (R2-backed) — the StockData shape is compatible.

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

const DATA_DIR = path.join(process.cwd(), "data");
const STOCK_FILE = path.join(DATA_DIR, "stock.json");

const EMPTY_DATA: StockData = {
  version: 2,
  updatedAt: "",
  items: [],
};

export function readStockJson(): StockData {
  try {
    if (!fs.existsSync(STOCK_FILE)) {
      return { ...EMPTY_DATA };
    }
    const raw = fs.readFileSync(STOCK_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StockData;
    // Migrate v1 (slug-only) if needed — treat as empty
    if (!parsed.items.every((i) => "model" in i)) {
      return { ...EMPTY_DATA };
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read local stock:", error);
    return { ...EMPTY_DATA };
  }
}

export function writeStockJson(data: StockData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STOCK_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write local stock:", error);
    throw error;
  }
}

export function getStockBySlugAndModel(
  slug: string,
  model: string
): number | undefined {
  const data = readStockJson();
  return data.items.find((i) => i.slug === slug && i.model === model)?.stock;
}

export function getAllStockForSlug(slug: string): StockItem[] {
  const data = readStockJson();
  return data.items.filter((i) => i.slug === slug);
}