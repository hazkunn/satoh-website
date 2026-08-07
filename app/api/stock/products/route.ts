import { NextRequest, NextResponse } from "next/server";
import { readStockJson } from "@/lib/r2Json";
import { getProductBySlug, getItemSlugs, getModelCodesForSlug } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  try {
    const data = await readStockJson();
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      const staticProduct = getProductBySlug(slug);
      const modelCodes = staticProduct?.models ?? getModelCodesForSlug(slug) ?? [];

      const models = modelCodes.map((code) => {
        const stockItem = data.items.find(
          (i) => i.slug === slug && i.model === code
        );
        return { code, stock: stockItem?.stock ?? 0 };
      });

      if (!staticProduct && models.length === 0) {
        return NextResponse.json(
          { error: "商品が見つかりません" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        product: {
          slug,
          name: staticProduct?.name ?? slug,
          models,
        },
      });
    }

    const staticSlugs = getItemSlugs();
    const allSlugs = [...staticSlugs];
    for (const item of data.items) {
      if (!allSlugs.includes(item.slug)) allSlugs.push(item.slug);
    }

    const products = allSlugs.map((s) => {
      const staticProduct = getProductBySlug(s);
      const modelCodes = staticProduct?.models ?? getModelCodesForSlug(s) ?? [];
      const models = modelCodes.map((code) => {
        const stockItem = data.items.find(
          (i) => i.slug === s && i.model === code
        );
        return { code, stock: stockItem?.stock ?? 0 };
      });
      const totalStock = models.reduce((sum, m) => sum + m.stock, 0);
      return {
        slug: s,
        name: staticProduct?.name ?? s,
        totalStock,
        modelCount: models.length,
        models,
      };
    });

    return NextResponse.json({
      products,
      updatedAt: data.updatedAt,
    });
  } catch (err) {
    const msg = String(err);
    const isHandshake =
      msg.includes("handshake") ||
      msg.includes("EPROTO") ||
      msg.includes("alert number 40");
    console.error("[api/stock/products] Failed to read stock from R2:", err);
    return NextResponse.json(
      {
        error: "在庫データの読み込みに失敗しました",
        detail: msg,
        hint: isHandshake
          ? "R2 TLS handshake failed. Ensure Vercel is running Node 22.x (engines.node) and lib/r2*.ts uses NodeHttpHandler."
          : undefined,
      },
      { status: 500 }
    );
  }
}