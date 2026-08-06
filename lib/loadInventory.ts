import { unstable_cache } from "next/cache";
import {
  readStockJson,
  type StockData,
  type StockItem,
} from "./r2Json";

const EMPTY_DATA: StockData = {
  version: 2,
  updatedAt: "",
  items: [],
};

// IMPORTANT: do NOT catch R2 errors inside the cached callback.
// `unstable_cache` persists whatever the function returns, including an
// empty fallback. If a transient R2 failure were caught and returned as
// EMPTY_DATA here, that empty result would be cached for the full
// `revalidate` window (300s) and every page/stock-app would show "no stock"
// — exactly the "stock hasn't loaded" symptom.
//
// By letting errors propagate (unstable_cache does NOT cache thrown errors),
// only successful reads are cached. The try/catch lives in the public
// helpers below, *outside* the cache scope, so a failed read degrades
// gracefully without poisoning the cache.
const getCachedStock = unstable_cache(
  async (): Promise<StockData> => {
    return await readStockJson();
  },
  ["stock-data"],
  {
    tags: ["inventory"],
    revalidate: 300, // 5 minutes fallback
  }
);

/**
 * Load the full stock document from R2 (cached on success).
 * On R2 failure, returns an empty document WITHOUT caching it, so the
 * next request retries R2 immediately rather than serving stale empties.
 */
export async function getStockData(): Promise<StockData> {
  try {
    return await getCachedStock();
  } catch (error) {
    console.error("Failed to read stock from R2:", error);
    return EMPTY_DATA;
  }
}

export async function getStockBySlugAndModel(
  slug: string,
  model: string
): Promise<number | undefined> {
  const data = await getStockData();
  return data.items.find((i) => i.slug === slug && i.model === model)?.stock;
}

export async function getAllStockForSlug(slug: string): Promise<StockItem[]> {
  const data = await getStockData();
  return data.items.filter((i) => i.slug === slug);
}
