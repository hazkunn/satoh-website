/**
 * Step 1: Extract product names (商品名) + metadata from the Excel file.
 *
 * The Excel is a Mitsuboshi Belt (三ツ星ベルト) product catalog workbook.
 * The real data sheet is "提出用書式" with:
 *   col 4: ﾒｰｶｰ略称, col 5: 商品CD, col 6: 商品名,
 *   col 7: 規格・寸法, col 11: 単位名
 *
 * Row 1 = headers, row 2 = format desc, rows 3-4 = template rows,
 * real data starts from row 5.
 *
 * Usage:
 *   npx tsx scripts/extractProductNames.ts [input.xlsx]
 */
import * as fs from "node:fs";
import * as path from "node:path";
import ExcelJS from "exceljs";

type ProductEntry = {
  name: string;
  maker: string;
  productCode: string;
  spec: string;
  unit: string;
};

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if ("text" in (v as any)) return String((v as any).text).trim();
    if ("result" in (v as any)) return String((v as any).result).trim();
    if ("richText" in (v as any)) {
      return ((v as any).richText as any[])
        .map((r) => r.text)
        .join("")
        .trim();
    }
  }
  return String(v).trim();
}

async function main() {
  // resolve input path
  let inputPath = process.argv[2];
  if (!inputPath) {
    const dir = "excel converter (READ ONLY)";
    const candidates = fs
      .readdirSync(dir)
      .filter((f) => /\.xlsx$/i.test(f))
      .map((f) => path.join(dir, f));
    if (candidates.length === 0) {
      console.error("No .xlsx file found in 'excel converter (READ ONLY)/'");
      process.exit(1);
    }
    inputPath = candidates[0];
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading: ${inputPath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);

  // Find the data sheet — "提出用書式" or the one with 商品名 in row 1
  let sheet = workbook.getWorksheet("提出用書式");
  if (!sheet) {
    for (const ws of workbook.worksheets) {
      const headerCell = ws.getRow(1).getCell(6);
      if (cellText(headerCell).includes("商品名")) {
        sheet = ws;
        break;
      }
    }
  }
  if (!sheet) {
    console.error("Could not find a sheet with 商品名 header.");
    process.exit(1);
  }

  console.log(`   Sheet: "${sheet.name}"  rows=${sheet.rowCount}  cols=${sheet.columnCount}`);

  // Column mapping based on header row (row 1)
  const headerRow = sheet.getRow(1);
  const colMap: Record<string, number> = {};
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const text = cellText(cell);
    // Exact match for 商品名 (avoid matching 商品名ｶﾅ)
    if (text === "商品名") colMap.name = colNumber;
    else if (text === "商品CD") colMap.productCode = colNumber;
    else if (text.includes("ﾒｰｶｰ略称") || text.includes("メーカー略称")) colMap.maker = colNumber;
    else if (text.includes("規格") || text.includes("寸法")) colMap.spec = colNumber;
    else if (text === "単位名") colMap.unit = colNumber;
  });

  console.log(`   Column map:`, colMap);

  if (!colMap.name) {
    console.error("商品名 column not found!");
    process.exit(1);
  }

  // Data starts at row 5 (row 1=header, 2=format, 3-4=template)
  const dataStartRow = 5;

  // Extract, deduplicate by product name
  const seen = new Set<string>();
  const entries: ProductEntry[] = [];

  for (let r = dataStartRow; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const name = cellText(row.getCell(colMap.name));
    if (!name) continue;

    // Skip template/example rows
    if (name.includes("★") || name.includes("半角") || name.includes("全角")) continue;

    if (seen.has(name)) continue;
    seen.add(name);

    entries.push({
      name,
      maker: colMap.maker ? cellText(row.getCell(colMap.maker)) : "",
      productCode: colMap.productCode ? cellText(row.getCell(colMap.productCode)) : "",
      spec: colMap.spec ? cellText(row.getCell(colMap.spec)) : "",
      unit: colMap.unit ? cellText(row.getCell(colMap.unit)) : "",
    });
  }

  console.log(`\n   ✅ Extracted ${entries.length} unique product names\n`);

  // write compact output
  const outDir = path.dirname(inputPath);
  const namesPath = path.join(outDir, "product-names.json");
  const detailPath = path.join(outDir, "product-names-detail.json");

  fs.writeFileSync(namesPath, JSON.stringify(entries.map((e) => e.name), null, 2));
  fs.writeFileSync(detailPath, JSON.stringify(entries, null, 2));

  console.log(`   Wrote: ${namesPath}`);
  console.log(`   Wrote: ${detailPath}`);

  // Print the list
  console.log(`\n── Product names (${entries.length}) ──────────────────────`);
  entries.forEach((e, i) => {
    const extra = [e.maker, e.productCode, e.spec].filter(Boolean).join(" / ");
    console.log(`  ${i + 1}. ${e.name}${extra ? `  [${extra}]` : ""}`);
  });
  console.log(`──────────────────────────────────────────────────`);
}

main().catch((err) => {
  console.error("Extract failed:", err);
  process.exit(1);
});