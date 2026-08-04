import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { readStockJson, writeStockJson, type StockData } from "@/lib/r2Json";

export type MovementType = "add" | "sold";

export type MovementRequest = {
  slug: string;
  model: string;
  type: MovementType;
  quantity: number;
  operatorName: string;
};

export type MovementLog = {
  timestamp: string;
  slug: string;
  model: string;
  type: MovementType;
  quantity: number;
  operator: string;
  beforeStock: number;
  afterStock: number;
};

const movementLogs: MovementLog[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MovementRequest;
    const { slug, model, type, quantity } = body;

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

    let data: StockData;
    try {
      data = await readStockJson();
    } catch {
      data = { version: 2, updatedAt: "", items: [] };
    }

    const item = data.items.find(
      (i) => i.slug === slug && i.model === (model ?? "")
    );
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
      data.items.push({ slug, model: model ?? "", stock: afterStock });
    }
    data.updatedAt = new Date().toISOString();

    await writeStockJson(data);

    const log: MovementLog = {
      timestamp: new Date().toISOString(),
      slug,
      model: model ?? "",
      type,
      quantity,
      operator: "user",
      beforeStock,
      afterStock,
    };
    movementLogs.push(log);
    if (movementLogs.length > 500) {
      movementLogs.splice(0, movementLogs.length - 500);
    }

    revalidateTag("inventory", "max");

    return NextResponse.json({
      success: true,
      slug,
      model: model ?? "",
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
