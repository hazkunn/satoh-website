import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import {
  optimizeImage,
  isOptimizableImage,
  swapExtension,
} from "@/lib/imageOptimize";

export const runtime = "nodejs";

/**
 * Hard limit on the size of the *original* uploaded file (before optimization).
 * The intent is that a user picks an 8-11MB phone photo, sends it here, and we
 * shrink it down to a few hundred KB on the server before it ever touches R2.
 * If you need to accept even larger originals, raise this and also raise
 * `experimental.proxyClientMaxBodySize` in next.config.ts accordingly.
 */
const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * POST /api/upload
 * Upload a file to R2. Expects multipart/form-data with:
 *   - file: the file to upload
 *   - key (optional): custom path/key in the bucket
 *
 * Images are automatically optimized (resized + re-encoded as WebP, or kept as
 * PNG when transparency must be preserved) before being written to R2, so the
 * bucket only ever stores web-ready bytes. Non-image files are stored as-is.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_INPUT_BYTES) {
      return NextResponse.json(
        {
          error: `File too large. Max input size is ${MAX_INPUT_BYTES / (1024 * 1024)}MB. Received ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        },
        { status: 413 }
      );
    }

    // Generate a key: use provided key or generate one
    const customKey = formData.get("key") as string | null;
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const baseKey = customKey || `uploads/${timestamp}-${safeName}`;

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    let key = baseKey;
    let body: Buffer = inputBuffer;
    let contentType = file.type || "application/octet-stream";
    let optimized = false;
    const originalBytes = inputBuffer.byteLength;

    // Optimize images in-place before uploading to R2.
    if (isOptimizableImage(file.type)) {
      try {
        const result = await optimizeImage(inputBuffer);
        key = swapExtension(baseKey, result.ext);
        body = result.buffer;
        contentType = result.contentType;
        optimized = true;
      } catch (optimizeError) {
        // If optimization fails (e.g. corrupt image), fall back to the
        // original bytes rather than rejecting the upload entirely.
        console.error("[api/upload] Image optimization failed, storing original:", optimizeError);
      }
    }

    await uploadToR2(key, body, contentType);

    return NextResponse.json({
      success: true,
      key,
      url: `/api/files/${key}`,
      contentType,
      optimized,
      originalSize: originalBytes,
      storedSize: body.byteLength,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}
