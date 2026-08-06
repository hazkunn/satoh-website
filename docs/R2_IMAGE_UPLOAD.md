# R2 Image Upload — How It Works

> **Read this first.** This document is the single source of truth for how
> images get from disk into Cloudflare R2 for this website. If you're confused
> about "where the compressed image is" or "where did my upload go", the answer
> is in here.

## TL;DR — the actual folder of photos

The real photos that need uploading live here (note: the folder name is
literal, spaces and all):

```
c:\natsir\Ngoding\satoh-website\
  R2 Storage cloud. DO NOT PUSH AS SERVER DATA. it's for cloud storage\
    all_member.jpg          7.86 MB
    all_member_up.jpg      11.41 MB
    apprentice_training.jpg 8.90 MB
    company_building.jpg     8.14 MB
    company_frontdoor.jpg    7.97 MB
    company_future.jpg       5.52 MB
    company_logistic.jpg     7.83 MB
    company_office.jpg       9.63 MB
    company_window.jpg       5.96 MB
    exhibition_hall.jpg      9.20 MB
```

This folder is **gitignored** (see `.gitignore`). It is local working data,
never committed, never shipped as "server data". Its contents get compressed
and pushed into **Cloudflare R2** (the bucket named by `R2_BUCKET_NAME` in
`.env.local`).

---

## The pipeline (one line)

```
[R2 Storage cloud folder] --optimizeImage()--> [WebP/PNG, small] --uploadToR2()--> [R2 bucket]
```

## How to actually upload the photos

```bash
# 1. See what would happen (no uploads, just a report):
npx tsx scripts/uploadImagesToR2.ts

# 2. Actually compress + upload all of them to R2:
npx tsx scripts/uploadImagesToR2.ts --commit
```

Output shows, per file: original size → compressed size → reduction ratio →
the R2 key it will be stored under (e.g. `uploads/all_member.webp`).

Re-running with `--commit` is safe — it overwrites the same R2 keys.

## Where to find the uploaded images afterward

1. Go to **dash.cloudflare.com → R2 Object Storage → your bucket**
   (the bucket name is `R2_BUCKET_NAME` in `.env.local`).
2. Look under the **`uploads/`** prefix — e.g. `uploads/all_member.webp`.
3. Each object shows its size and content type (`image/webp`), and you can
   preview it inline.

## How to view an uploaded image in the browser

The site serves R2 objects via this route:

```
GET /api/files/<key>   →   redirects to R2 (public domain or presigned URL)
```

So an object stored at `uploads/all_member.webp` is reachable at:

```
https://<your-site>/api/files/uploads/all_member.webp
```

If `R2_PUBLIC_DOMAIN` is set in `.env.local`, this redirects to
`https://<that-domain>/uploads/all_member.webp`. Otherwise it redirects to a
presigned R2 URL (1-hour validity).

---

## The components

### 1. `lib/imageOptimize.ts` — the compressor

- `optimizeImage(buffer, opts?)`
  - Resizes the longest edge to ≤ 2000px (only downscales, never upscales).
  - Re-encodes photos as **WebP @ quality 80**.
  - Keeps **PNG** when the source has transparency (so alpha is preserved),
    unless `forceWebp: true`.
  - Strips all EXIF/ICC/XMP metadata (shrinks file + removes GPS/camera info).
  - Returns `{ buffer, contentType, ext }`.
- `isOptimizableImage(contentType)` — quick MIME check.
- `swapExtension(key, ext)` — `foo.jpeg` → `foo.webp`.

Uses `sharp` (already in `node_modules` via Next.js — no extra dependency).

### 2. `app/api/upload/route.ts` — the web upload endpoint

`POST /api/upload` with multipart/form-data:
- `file` (required) — the image
- `key` (optional) — custom R2 key

Behaviour:
- If the file is an image → run `optimizeImage()` → store the compressed
  result in R2 (key extension rewritten to `.webp`/`.png`).
- If not an image → store as-is.
- Max input size: 25 MB (returns `413` if exceeded).
- If optimization fails on a corrupt image, falls back to storing the
  original.
- Response JSON includes `optimized`, `originalSize`, `storedSize` so the
  caller can see the compression result.

### 3. `app/api/presigned-url/route.ts` — ⚠️ bypasses optimization

`POST /api/presigned-url` returns a presigned URL for the browser to PUT
**directly** to R2. Because it skips the server, **no optimization happens**.
Use this only for non-image files, or when you intentionally want the
original bytes. **For images, use `/api/upload`.**

### 4. `scripts/uploadImagesToR2.ts` — the batch CLI

Compresses and uploads every image in the "R2 Storage cloud" folder in one
go. This is the script to use for the existing set of photos. See usage above.

### 5. `next.config.ts`

`experimental.proxyClientMaxBodySize: "25mb"` — raises the default 10 MB body
buffer so large originals (8–11 MB photos) reach the `/api/upload` handler
intact instead of being silently truncated.

---

## Expected results

The phone photos in the folder are 5.5–11.4 MB each. After optimization they
will typically land at **~100–300 KB each** (WebP, ≤2000px, q80) — roughly a
**30–80× reduction** for real photographic content.

(An earlier synthetic-noise test image only reached 8.4× because random noise
compresses poorly; real photos compress far better.)

## Cleanup / notes

- `scripts/sample-original.jpg` and `scripts/sample-compressed.webp` were
  created by an earlier proof script (`scripts/proofImageUpload.ts`) and may
  still exist. They're harmless test artifacts and can be deleted.
- The proof script also uploaded `uploads/proof-sample.webp` to R2. Delete it
  from the bucket if you don't want it.
- The `.gitignore` entry for the "R2 Storage cloud" folder is required —
  without it, `git add .` would commit ~83 MB of photos.
