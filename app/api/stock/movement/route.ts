import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkAuth, SESSION_COOKIE } from "@/lib/auth";
import { readStockJson, writeStockJson, type StockData } from "@/lib/r2Json";

export type MovementType = "add" | "sold";

export type MovementRequest = {
  slug: string;
  type: MovementType;
  quantity: number;
  operatorName: string;
};

export type MovementLog = {
  timestamp: string;
  slug: string;
  type: MovementType;
  quantity: number;
  operator: string;
  beforeStock: number;
  afterStock: number;
};

// In-memory log (resets on serverless cold start; for production use R2 or a DB)
const movementLogs: MovementLog[] = [];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;
    const operator = await checkAuth(cookie);

    if (!operator) {
      return NextResponse.json(
        { error: "認証が必要です。ログインしてください。" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as MovementRequest;
    const { slug, type, quantity } = body;

    // Validation
    if (!slug || !type || !quantity) {
      return NextResponse.json(
        { error: "slug, type, quantity は必須です" },
        { status: 400 }
      );
    }

    if (type !== "add" && type !== "sold") {
      return NextResponse.json(
        { error: "type は 'add' または 'sold' である必要があります" },
        { status: 400 }
      );
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "quantity は正の整数である必要があります" },
        { status: 400 }
      );
    }

    // Read current stock data from R2
    let data: StockData;
    try {
      data = await readStockJson();
    } catch {
      // If no stock file exists yet, start with an empty one
      data = { version: 1, updatedAt: "", items: [] };
    }

    const item = data.items.find((i) => i.slug === slug);
    const beforeStock = item?.stock ?? 0;

    let afterStock = beforeStock;
    if (type === "add") {
      afterStock = beforeStock + quantity;
    } else {
      afterStock = Math.max(0, beforeStock - quantity);
    }

    if (item) {
      item.stock = afterStock;
    } else {
      data.items.push({ slug, stock: afterStock });
    }
    data.updatedAt = new Date().toISOString();

    // Write back to R2
    await writeStockJson(data);

    // Log the movement
    const log: MovementLog = {
      timestamp: new Date().toISOString(),
      slug,
      type,
      quantity,
      operator,
      beforeStock,
      afterStock,
    };
    movementLogs.push(log);
    // Keep only last 500 logs in memory
    if (movementLogs.length > 500) {
      movementLogs.splice(0, movementLogs.length - 500);
    }

    // Revalidate cache so the website updates immediately
    revalidateTag("inventory", { expire: 0 });

    return NextResponse.json({
      success: true,
      slug,
      beforeStock,
      afterStock,
      movement: log,
    });
  } catch (error) {
    console.error("Movement API error:", error);
    return NextResponse.json(
      { error: "在庫更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ logs: movementLogs.slice(-50).reverse() });
}