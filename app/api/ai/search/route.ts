import { NextRequest, NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/inventory";

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

    // Use precomputed index (single pass, O(n) per search)
    const { products, brands } = getSearchIndex();
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (seen.has(p.slug)) continue;

      // 1. Match product name (bidirectional)
      if (p.nameLower.includes(q) || q.includes(p.nameLower)) {
        seen.add(p.slug);
        results.push({
          name: p.name,
          slug: p.slug,
          category: p.category,
          url: p.url,
          matchType: "name",
          snippet: p.name,
        });
        continue;
      }

      // 2. Match category (bidirectional)
      if (p.categoryLower.includes(q) || q.includes(p.categoryLower)) {
        seen.add(p.slug);
        results.push({
          name: p.name,
          slug: p.slug,
          category: p.category,
          url: p.url,
          matchType: "category",
          snippet: `カテゴリ: ${p.category}`,
        });
        continue;
      }

      // 3. Match model numbers (bidirectional)
      let matched = false;
      for (const m of p.modelsLower) {
        if (m.includes(q) || q.includes(m)) {
          seen.add(p.slug);
          results.push({
            name: p.name,
            slug: p.slug,
            category: p.category,
            url: p.url,
            matchType: "model",
            snippet: `型番: ${p.models[p.modelsLower.indexOf(m)]}`,
          });
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // 4. Match specifications (bidirectional)
      for (const s of p.specs) {
        const lab = s.label.toLowerCase();
        const val = s.value.toLowerCase();
        if (lab.includes(q) || q.includes(lab) || val.includes(q) || q.includes(val)) {
          seen.add(p.slug);
          results.push({
            name: p.name,
            slug: p.slug,
            category: p.category,
            url: p.url,
            matchType: "spec",
            snippet: `${s.label}: ${s.value}`,
          });
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // 5. Match description
      if (p.descriptionLower.includes(q)) {
        seen.add(p.slug);
        results.push({
          name: p.name,
          slug: p.slug,
          category: p.category,
          url: p.url,
          matchType: "name",
          snippet: p.description.substring(0, 100),
        });
      }
    }

    // 6. Brand search (pre-indexed — O(brands) instead of O(products × specs))
    for (const b of brands) {
      const p = products[b.productIdx];
      if (seen.has(p.slug)) continue;
      if (b.brandLower.includes(q) || q.includes(b.brandLower)) {
        seen.add(p.slug);
        results.push({
          name: p.name,
          slug: p.slug,
          category: p.category,
          url: p.url,
          matchType: "brand",
          snippet: `対応メーカー: ${b.brandValue}`,
        });
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