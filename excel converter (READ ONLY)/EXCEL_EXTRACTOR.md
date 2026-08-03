# Excel Extractor Workflow

This document explains how to extract product data from Excel files and integrate it into the website inventory system.

---

## Overview

The website uses a static catalog approach:

- Product specifications live in TypeScript code (`lib/inventory.ts`, `lib/vBeltModelsData.ts`).
- Stock counts live in R2 (Cloudflare R2 bucket), loaded at runtime via `lib/loadInventory.ts`.
- Excel files are the source of truth. They are converted to TypeScript data files at build time, NOT read at runtime.

Flow: Excel → JSON → TypeScript data file → static pages

---

## Directory Structure

- `excel converter (READ ONLY)/` — Drop Excel files here (DO NOT modify)
- `scripts/excelConverter.ts` — Step 1: Excel → JSON/CSV
- `scripts/extractProductNames.ts` — Extracts unique product names from Excel
- `scripts/extractVBeltModels.ts` — Step 2: JSON → TypeScript data (V-belts)
- `lib/inventory.ts` — Static catalog (manually curated hierarchy + product details)
- `lib/vBeltModelsData.ts` — Auto-generated from Excel (DO NOT hand-edit)

---

## Inventory Hierarchy

The listing uses a 5-level collapsible hierarchy:

```
Category → SubCategory → ProductType → Brand → Series(→ Model)
```

### Example (current data):

```
電動機器
  └─ 伝達機器
       └─ Vベルト
            └─ 三ツ星（Mitsuboshi）
                 ├─ スタンダードVベルト A形 → A19, A20, ..., A100
                 └─ スタンダードVベルト B形 → B19, B20, ..., B102
```

### All 17 top-level categories:

1. プラント資材
2. 管工器材
3. 電動機器
4. 軸受関連商品
5. 油圧・空圧機器
6. 物流・省力機器
7. 自動化・制御機器
8. 包装機器
9. 工作機械・制罐機械
10. 溶接機材
11. 工具類
12. 計器・測定器
13. 住設機器
14. 環境機器
15. 鋼材類
16. ネジ類
17. ホース類

Only `電動機器` has data right now. Others are empty placeholders (show header, no expand arrow).

---

## Step-by-Step: Adding a New Product

### Step 1: Add the Excel File

Drop the `.xlsx` file into `excel converter (READ ONLY)/`.
The converter picks the first `.xlsx` it finds.

### Step 2: Convert Excel to JSON

```bash
npx tsx scripts/excelConverter.ts
```

Outputs in `excel converter (READ ONLY)/`:
- `excel-full.json` / `excel-full.csv` — Raw extraction
- `excel-clean.json` — Cleaned data (starts at row 5)
- `product-names.json` — Unique product names
- `product-names-detail.json` — Detailed breakdown

### Step 3: Extract Product-Specific Data

extract ONLY the 商品名 from the excel, after you extract it, you can find the specification from the naming pattern on the internet. 

For V-belts:
```bash
npx tsx scripts/extractVBeltModels.ts
```

This writes `lib/vBeltModelsData.ts` (auto-generated, DO NOT hand-edit).

For **other product types**: Create a new `scripts/extractXxxModels.ts` following the same pattern. Output a TypeScript data file in `lib/`.

### Step 4: Add to the Hierarchy in `lib/inventory.ts`

Find the right **Category** in `inventoryDataRaw`. Add or nest:

```typescript
{
  category: "電動機器",   // ← pick the right top-level category
  subCategories: [
    {
      subCategory: "伝達機器",  // ← sub-category inside
      productTypes: [
        {
          productType: "Vベルト",  // ← product type
          brands: [
            {
              brand: "三ツ星（Mitsuboshi）",  // ← brand name
              series: [
                {
                  name: "三ツ星 Vベルト A形",
                  slug: "mitsuboshi-v-belt-a",
                  series: "スタンダードVベルト A形",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

### Step 5: Add Product Details

In the `detailedProducts` record in `lib/inventory.ts`, add:

```typescript
"your-product-slug": {
  slug: "your-product-slug",
  name: "Product Name",
  category: "伝達機器",   // matches the subCategory description
  maker: "三ツ星（Mitsuboshi）",
  series: "スタンダードVベルト A形",
  description: "Description here. Look up official specs online.",
  models: ["A19", "A20", ...],  // from extracted data
  specifications: [
    { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
    { label: "規格", value: "JIS K6323" },
    // ... look up real specs from manufacturer catalog
  ],
},
```

**Important**: 
- Look up specifications from the official manufacturer website/catalog.
- Do NOT include prices (per HOW TO.txt instructions).
- Only include real data from the Excel file + internet research.

### Step 6: Add Per-Model Pages (if applicable)

If the product has individual model detail pages (like V-belt A19, A20, etc.):

1. Create a helper function in `lib/inventory.ts` (like `getVBeltModelSpecs`)
2. Add the slug to `getVBeltProductSlugs()`
3. The `app/inventory/[slug]/[model]/page.tsx` auto-generates pages via `generateStaticParams()`

### Step 7: Build and Verify

```bash
npm run build
```

Check the output for the correct number of pages (currently 186 = 2 series pages + 164 model pages + others).

---

## Key Rules

- `lib/vBeltModelsData.ts` is **auto-generated**. Do NOT hand-edit.
- `excel converter (READ ONLY)/` is **read-only** by convention.
- The converter expects data starting at **row 5**. Adjust `dataStartRow` if your Excel differs.
- **No prices** — only specifications from Excel + internet research.
- Brand (三ツ星) is NOT a category level. It sits 4 levels deep inside the hierarchy.
- The listing page (`app/inventory/page.tsx`) uses collapsible accordions — empty categories show only the header.

---

## File Reference

| File | Purpose | Edit? |
|------|---------|-------|
| `excel converter (READ ONLY)/*.xlsx` | Source Excel data | ❌ Read-only |
| `scripts/excelConverter.ts` | Excel → JSON | Only to change extraction logic |
| `scripts/extractVBeltModels.ts` | JSON → TS data (V-belts) | Only for new product types |
| `lib/vBeltModelsData.ts` | Auto-generated model data | ❌ Never hand-edit |
| `lib/inventory.ts` | Hierarchy + curated product details | ✅ Add products here |
| `app/inventory/page.tsx` | Listing page (collapsible accordion) | Rarely |
| `app/inventory/[slug]/page.tsx` | Series detail page (model list) | Rarely |
| `app/inventory/[slug]/[model]/page.tsx` | Individual model spec page | Rarely |
| `app/api/ai/search/route.ts` | Search API (indexes all products) | Rarely |
| `app/api/ai/route.ts` | AI chat route | Rarely |