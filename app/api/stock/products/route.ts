import { NextRequest, NextResponse } from "next/server";
import { checkAuth, SESSION_COOKIE } from "@/lib/auth";
import { readStockJson } from "@/lib/r2Json";
import { getProductBySlug, getItemSlugs } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const operator = await checkAuth(cookie);

  if (!operator) {
    return NextResponse.json(
      { error: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    const data = await readStockJson();
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      // Join static catalog data with R2 stock
      const staticProduct = getProductBySlug(slug);
      const stockItem = data.items.find((i) => i.slug === slug);
      const stock = stockItem?.stock ?? 0;

      if (!staticProduct && !stockItem) {
        return NextResponse.json(
          { error: "商品が見つかりません" },
          { status: 404 }
        );
      }

      const product = {
        slug,
        name: staticProduct?.name ?? slug,
        models: staticProduct?.models ?? [],
        stock,
      };

      return NextResponse.json({ product });
    }

    // Return all products — static slugs merged with R2 stock
    const staticSlugs = getItemSlugs();
    const allSlugs = [...staticSlugs];
    for (const item of data.items) {
      if (!allSlugs.includes(item.slug)) allSlugs.push(item.slug);
    }

    const products = allSlugs.map((slug) => {
      const staticProduct = getProductBySlug(slug);
      const stock = data.items.find((i) => i.slug === slug)?.stock ?? 0;
      return {
        slug,
        name: staticProduct?.name ?? slug,
        stock,
        models: staticProduct?.models ?? [],
      };
    });

    return NextResponse.json({
      products,
      updatedAt: data.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { error: "在庫データの読み込みに失敗しました" },
      { status: 500 }
    );
  }
}