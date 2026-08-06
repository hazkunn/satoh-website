/**
 * Manual sanity check for lib/imageOptimize.ts.
 *
 * Creates a large noisy JPEG (simulating an 8-11MB phone photo), runs it
 * through optimizeImage, and prints before/after sizes + output format.
 *
 * Run with:  npx tsx scripts/testImageOptimize.ts
 */
import sharp from "sharp";
import { optimizeImage, isOptimizableImage, swapExtension } from "../lib/imageOptimize";

async function main() {
  // Build a big, high-entropy image: 4000x3000 RGB with random-ish noise so
  // JPEG compression can't shrink it much — mirroring a real photo's size.
  const W = 4000;
  const H = 3000;
  const channels = 3;
  const raw = Buffer.alloc(W * H * channels);
  for (let i = 0; i < raw.length; i += channels) {
    // pseudo-random pattern so the JPEG encoder stays large
    const v = (Math.sin(i * 0.013) * 127 + 128) & 0xff;
    raw[i] = v ^ ((i * 7) & 0xff);
    raw[i + 1] = v ^ ((i * 13) & 0xff);
    raw[i + 2] = v ^ ((i * 29) & 0xff);
  }

  const originalJpeg = await sharp(raw, { raw: { width: W, height: H, channels } })
    .jpeg({ quality: 95 })
    .toBuffer();

  console.log("Original JPEG:");
  console.log("  size:      ", (originalJpeg.byteLength / (1024 * 1024)).toFixed(2), "MB");
  console.log("  isOptimizable:", isOptimizableImage("image/jpeg"));

  const result = await optimizeImage(originalJpeg);
  const meta = await sharp(result.buffer).metadata();

  console.log("\nOptimized:");
  console.log("  size:      ", (result.buffer.byteLength / 1024).toFixed(0), "KB");
  console.log("  contentType:", result.contentType);
  console.log("  ext:       ", result.ext);
  console.log("  dimensions: ", `${meta.width}x${meta.height}`);
  console.log("  format:    ", meta.format);

  console.log("\nswapExtension tests:");
  console.log("  uploads/foo.jpeg -> ", swapExtension("uploads/foo.jpeg", "webp"));
  console.log("  uploads/foo      -> ", swapExtension("uploads/foo", "webp"));
  console.log("  a/b/c.PNG        -> ", swapExtension("a/b/c.PNG", "webp"));

  // Also test a PNG with alpha (should stay PNG).
  const pngWithAlpha = await sharp({
    create: { width: 800, height: 600, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  const pngResult = await optimizeImage(pngWithAlpha);
  console.log("\nPNG-with-alpha -> ", pngResult.contentType, "ext:", pngResult.ext);

  const ratio = originalJpeg.byteLength / result.buffer.byteLength;
  console.log(`\nCompression ratio: ${ratio.toFixed(1)}x smaller`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
