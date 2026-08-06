import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * POST /api/presigned-url
 * Generate a presigned URL for direct browser-to-R2 upload.
 * Body: { key: string, contentType: string, expiresIn?: number }
 *
 * ⚠️ IMPORTANT: Files uploaded via this route go *directly* from the browser
 * to R2 and bypass the server entirely, so they are NOT optimized (no resize,
 * no WebP conversion, no size guard). For images you almost always want the
 * multipart `/api/upload` route instead, which optimizes with sharp before
 * writing to R2 and stores only the web-ready bytes.
 *
 * Use this route only for non-image files, or for cases where you intentionally
 * need the original bytes in R2 and will optimize later.
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
