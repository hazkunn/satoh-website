import { unstable_cache } from "next/cache";
import {
  readStockJson,
  type StockData,
} from "./r2Json";

const EMPTY_DATA: StockData = {
  version: 1,
  updatedAt: "",
  items: [],
};

export const getStockData = unstable_cache(
  async (): Promise<StockData> => {
    try {
      return await readStockJson();
    } catch (error) {
      console.error("Failed to read stock from R2:", error);
      return EMPTY_DATA;
    }
  },
  ["stock-data"],
  {
    tags: ["inventory"],
    revalidate: 300, // 5 minutes fallback
  }
);

export async function getStockBySlug(slug: string): Promise<number | undefined> {
  const data = await getStockData();
  return data.items.find((i) => i.slug === slug)?.stock;
}