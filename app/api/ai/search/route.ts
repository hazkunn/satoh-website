import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, getProductBySlug } from "@/lib/inventory";

export type SearchResult = {
  name: string;
  slug: string;
  category: string;
  url: string;
  matchType: "name" | "model" | "spec" | "category" | "brand";
  snippet: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "query string is required" },
        { status: 400 }
      );
    }

    const q = query.toLowerCase().trim();
    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const results: SearchResult[] = [];
    const seen = new Set<string>();

    const categories = getAllCategories();

    for (const cat of categories) {
      for (const item of cat.items) {
        const product = getProductBySlug(item.slug);
        if (!product) continue;

        // 1. Search product name
        if (product.name.toLowerCase().includes(q)) {
          if (!seen.has(product.slug)) {
            seen.add(product.slug);
            results.push({
              name: product.name,
              slug: product.slug,
              category: product.category,
              url: `/inventory/${product.slug}`,
              matchType: "name",
              snippet: product.name,
            });
          }
          continue;
        }

        // 2. Search category name
        if (product.category.toLowerCase().includes(q)) {
          if (!seen.has(product.slug)) {
            seen.add(product.slug);
            results.push({
              name: product.name,
              slug: product.slug,
              category: product.category,
              url: `/inventory/${product.slug}`,
              matchType: "category",
              snippet: `カテゴリ: ${product.category}`,
            });
          }
          continue;
        }

        // 3. Search model numbers
        if (product.models && product.models.length > 0) {
          const matchedModel = product.models.find((m) =>
            m.toLowerCase().includes(q)
          );
          if (matchedModel) {
            if (!seen.has(product.slug)) {
              seen.add(product.slug);
              results.push({
                name: product.name,
                slug: product.slug,
                category: product.category,
                url: `/inventory/${product.slug}`,
                matchType: "model",
                snippet: `型番: ${matchedModel}`,
              });
            }
            continue;
          }
        }

        // 4. Search specifications
        if (product.specifications && product.specifications.length > 0) {
          const matchedSpec = product.specifications.find(
            (s) =>
              s.label.toLowerCase().includes(q) ||
              s.value.toLowerCase().includes(q)
          );
          if (matchedSpec) {
            if (!seen.has(product.slug)) {
              seen.add(product.slug);
              results.push({
                name: product.name,
                slug: product.slug,
                category: product.category,
                url: `/inventory/${product.slug}`,
                matchType: "spec",
                snippet: `${matchedSpec.label}: ${matchedSpec.value}`,
              });
            }
            continue;
          }
        }

        // 5. Search description
        if (product.description.toLowerCase().includes(q)) {
          if (!seen.has(product.slug)) {
            seen.add(product.slug);
            results.push({
              name: product.name,
              slug: product.slug,
              category: product.category,
              url: `/inventory/${product.slug}`,
              matchType: "name",
              snippet: product.description.substring(0, 100),
            });
          }
        }
      }
    }

    // Also search brand names in specifications
    for (const cat of categories) {
      for (const item of cat.items) {
        const product = getProductBySlug(item.slug);
        if (!product || !product.specifications) continue;
        if (seen.has(product.slug)) continue;

        const brandSpec = product.specifications.find(
          (s) =>
            s.label.includes("メーカー") &&
            s.value.toLowerCase().includes(q)
        );
        if (brandSpec) {
          seen.add(product.slug);
          results.push({
            name: product.name,
            slug: product.slug,
            category: product.category,
            url: `/inventory/${product.slug}`,
            matchType: "brand",
            snippet: `対応メーカー: ${brandSpec.value}`,
          });
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to process search" },
      { status: 500 }
    );
  }
}