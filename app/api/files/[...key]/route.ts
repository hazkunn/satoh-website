import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl, getPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * GET /api/files/[...key]
 * Serve a file from R2. Returns a redirect to either:
 *   - A public URL (if R2_PUBLIC_DOMAIN is configured)
 *   - A presigned URL (fallback)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = keyParts.join("/");

    if (!key) {
      return NextResponse.json({ error: "No key provided" }, { status: 400 });
    }

    // Try public URL first
    const publicUrl = getPublicUrl(key);
    if (publicUrl) {
      return NextResponse.redirect(publicUrl);
    }

    // Fallback to presigned URL
    const presignedUrl = await getPresignedDownloadUrl(key);
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "File not found", details: String(error) },
      { status: 404 }
    );
  }
}