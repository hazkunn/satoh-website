import sharp from "sharp";

/**
 * Image optimization utilities for R2 uploads.
 *
 * Website photos rarely need to be more than ~2000px on the long edge, and
 * WebP at quality ~80 is visually indistinguishable from the original JPEG
 * for photographic content while being ~25-35% smaller. These helpers turn
 * the multi-megabyte files that come off a phone/camera into web-ready
 * bytes *before* they are written to R2, so the bucket only ever stores the
 * final, efficient payload.
 */

export interface OptimizeImageOptions {
  /** Maximum width/height of the longest edge in pixels. Default: 2000. */
  maxWidth?: number;
  /** WebP quality (1-100). Default: 80. */
  quality?: number;
  /**
   * Whether to enforce WebP output even for images with transparency.
   * When false (default), PNG inputs keep their .png extension so alpha is
   * preserved. When true, everything becomes WebP.
   */
  forceWebp?: boolean;
}

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

const DEFAULT_MAX_WIDTH = 2000;
const DEFAULT_QUALITY = 80;

const INPUT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
  "image/bmp",
]);

/**
 * Returns true if the given MIME type is an image we know how to optimize.
 */
export function isOptimizableImage(contentType: string | undefined | null): boolean {
  if (!contentType) return false;
  return INPUT_IMAGE_TYPES.has(contentType.toLowerCase().split(";")[0].trim());
}

/**
 * Optimize an image buffer for web delivery.
 *
 * - Resizes so the longest edge is at most `maxWidth` (only downscales; never
 *   upscales).
 * - Re-encodes as WebP at the given quality for photos, or keeps PNG when the
 *   source is a PNG and `forceWebp` is false (preserves transparency).
 * - Strips metadata (EXIF, ICC, etc.) to further shrink the payload.
 *
 * @returns the optimized buffer plus the content type and file extension to
 *          use when storing the result.
 */
export async function optimizeImage(
  input: Buffer,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImage> {
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const forceWebp = options.forceWebp ?? false;

  // Inspect the source so we can decide on output format and avoid upscaling.
  const metadata = await sharp(input).metadata();
  const sourceHasAlpha = Boolean(metadata.hasAlpha);
  const sourceFormat = (metadata.format || "").toLowerCase();

  // Only ever downscale — never enlarge a small image.
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const longestEdge = Math.max(width, height);
  const shouldResize = longestEdge > maxWidth;

  let pipeline = sharp(input, { failOn: "none" }).rotate(); // auto-orient from EXIF

  if (shouldResize) {
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxWidth,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Keep PNG for transparency unless explicitly forced to WebP.
  const keepPng = sourceHasAlpha && !forceWebp && sourceFormat === "png";

  let contentType: string;
  let ext: string;

  if (keepPng) {
    pipeline = pipeline.png({
      quality,
      compressionLevel: 9,
      palette: false,
      effort: 7,
    });
    contentType = "image/png";
    ext = "png";
  } else {
    pipeline = pipeline.webp({
      quality,
      effort: 4,
      alphaQuality: 90,
    });
    contentType = "image/webp";
    ext = "webp";
  }

  // sharp strips all metadata (EXIF/ICC/XMP) by default when producing the
  // output buffer — we do NOT call .withMetadata(), so GPS/camera info is
  // dropped, which both shrinks the file and avoids leaking private data.
  const buffer = await pipeline.toBuffer();

  return { buffer, contentType, ext };
}

/**
 * Replace the extension of a file key/path with a new one.
 * "uploads/foo.jpeg" + "webp" -> "uploads/foo.webp"
 * "uploads/foo"        + "webp" -> "uploads/foo.webp"
 */
export function swapExtension(key: string, newExt: string): string {
  const lastSlash = Math.max(key.lastIndexOf("/"), key.lastIndexOf("\\"));
  const filePart = lastSlash >= 0 ? key.slice(lastSlash + 1) : key;
  const dirPart = lastSlash >= 0 ? key.slice(0, lastSlash + 1) : "";
  const dot = filePart.lastIndexOf(".");
  const base = dot > 0 ? filePart.slice(0, dot) : filePart;
  return `${dirPart}${base}.${newExt}`;
}
