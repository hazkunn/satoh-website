import "server-only";
import {
  getProductBySlug,
  getItemSlugs,
  type Product,
} from "./inventory";

/**
 * Get a product by slug. Static catalog data (specs, models, description)
 * comes from the codebase; the live stock count is overlaid from R2.
 */
export async function getProductBySlugAsync(
  slug: string
): Promise<Product | undefined> {
  return getProductBySlug(slug);
}

/**
 * Get all slugs — static slugs plus any R2-only slugs.
 */
export async function getItemSlugsAsync(): Promise<string[]> {
  const { getStockData } = await import("./loadInventory");
  const staticSlugs = getItemSlugs();
  const data = await getStockData();
  const merged = [...staticSlugs];
  for (const item of data.items) {
    if (!merged.includes(item.slug)) merged.push(item.slug);
  }
  return merged;
}