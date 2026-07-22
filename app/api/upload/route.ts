import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * Upload a file to R2. Expects multipart/form-data with:
 *   - file: the file to upload
 *   - key (optional): custom path/key in the bucket
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a key: use provided key or generate one
    const customKey = formData.get("key") as string | null;
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = customKey || `uploads/${timestamp}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      success: true,
      key,
      url: `/api/files/${key}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}