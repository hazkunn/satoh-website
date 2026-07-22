import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * POST /api/presigned-url
 * Generate a presigned URL for direct browser-to-R2 upload.
 * Body: { key: string, contentType: string, expiresIn?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, contentType, expiresIn } = body;

    if (!key || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: key, contentType" },
        { status: 400 }
      );
    }

    const url = await getPresignedUploadUrl(key, contentType, expiresIn);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL", details: String(error) },
      { status: 500 }
    );
  }
}