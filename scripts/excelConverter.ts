/**
 * Excel Converter — reads an Excel product catalog and converts it
 * to JSON + CSV so it can be consumed by the website inventory system.
 *
 * The workbook "1~2［分類］三ツ星ﾍﾞﾙﾄA・B.xlsx" has multiple sheets.
 * The main data sheet is "提出用書式" (158 columns × 169 rows).
 * Row 1 = headers, row 2 = format description, rows 3-4 = template,
 * data starts at row 5.
 *
 * Output files (written next to the .xlsx):
 *   - excel-full.json    — every row × every column (objects keyed by header)
 *   - excel-full.csv     — same data in CSV form
 *   - product-names.json — compact array of unique 商品名
 *   - product-names-detail.json — with maker, code, spec, unit
 *
 * Usage:
 *   npx tsx scripts/excelConverter.ts [input.xlsx]
 */
import * as fs from "node:fs";
import * as path from "node:path";
import ExcelJS from "exceljs";

// ── helpers ──────────────────────────────────────────────────

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    // Formula cell: { formula: "...", result: 123 } or { formula: "...", result: { ... } }
    if ("formula" in (v as any) && "result" in (v as any)) {
      const result = (v as any).result;
      if (result === null || result === undefined) return "";
      if (typeof result === "object") {
        if ("text" in result) return String(result.text).trim();
        if ("richText" in result) {
          return (result.richText as any[]).map((r) => r.text).join("").trim();
        }
        return "";
      }
      return String(result).trim();
    }
    // Shared string with rich text: { richText: [...] }
    if ("richText" in (v as any)) {
      return ((v as any).richText as any[])
        .map((r) => r.text)
        .join("")
        .trim();
    }
    // Hyperlink: { text: "...", hyperlink: "..." }
    if ("text" in (v as any)) return String((v as any).text).trim();
    // Date object
    if (v instanceof Date) return v.toISOString().split("T")[0];
  }
  return String(v).trim();
}

/** Escape a value for CSV (RFC 4180). */
function csvEscape(value: string): string {
  if (value === "") return "";
  if (/["\r\n,]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/** Find the data sheet — "提出用書式" or first sheet with 商品名 in row 1. */
function findDataSheet(wb: ExcelJS.Workbook): ExcelJS.Worksheet | undefined {
  let sheet = wb.getWorksheet("提出用書式");
  if (sheet) return sheet;
  for (const ws of wb.worksheets) {
    for (let c = 1; c <= ws.columnCount; c++) {
      if (cellText(ws.getRow(1).getCell(c)) === "商品名") return ws;
    }
  }
  return undefined;
}

// ── main ─────────────────────────────────────────────────────

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

  // ── Dump all sheets overview ──
  console.log(`\n   Sheets in workbook:`);
  for (const ws of workbook.worksheets) {
    console.log(`     - "${ws.name}"  (${ws.rowCount} rows × ${ws.columnCount} cols)`);
  }

  // ── Convert main data sheet ──
  const sheet = findDataSheet(workbook);
  if (!sheet) {
    console.error("Could not find data sheet with 商品名 header.");
    process.exit(1);
  }

  console.log(`\n   Main data sheet: "${sheet.name}"  rows=${sheet.rowCount}  cols=${sheet.columnCount}`);

  // Build header map from row 1
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  const colMap: Record<string, number> = {};

  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const text = cellText(cell);
    headers[colNumber - 1] = text || `col_${colNumber}`;
    // Key columns (exact match)
    if (text === "商品名") colMap.name = colNumber;
    else if (text === "商品CD") colMap.productCode = colNumber;
    else if (text.includes("ﾒｰｶｰ略称") || text.includes("メーカー略称")) colMap.maker = colNumber;
    else if (text === "規格・寸法") colMap.spec = colNumber;
    else if (text === "単位名") colMap.unit = colNumber;
  });

  console.log(`   Key columns:`, colMap);

  // Data starts at row 5 (1=header, 2=format desc, 3-4=template rows)
  const dataStartRow = 5;

  // ── Extract all rows as objects ──
  const allRows: Record<string, string>[] = [];
  const productEntries: { name: string; maker: string; productCode: string; spec: string; unit: string }[] = [];
  const seenNames = new Set<string>();

  for (let r = dataStartRow; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const obj: Record<string, string> = {};

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1] || `col_${colNumber}`;
      obj[header] = cellText(cell);
    });

    // Skip completely empty rows
    const hasData = Object.values(obj).some((v) => v !== "");
    if (!hasData) continue;

    allRows.push(obj);

    // Track unique products
    if (colMap.name) {
      const name = obj[headers[colMap.name - 1]] || "";
      if (name && !seenNames.has(name)) {
        seenNames.add(name);
        productEntries.push({
          name,
          maker: colMap.maker ? obj[headers[colMap.maker - 1]] || "" : "",
          productCode: colMap.productCode ? obj[headers[colMap.productCode - 1]] || "" : "",
          spec: colMap.spec ? obj[headers[colMap.spec - 1]] || "" : "",
          unit: colMap.unit ? obj[headers[colMap.unit - 1]] || "" : "",
        });
      }
    }
  }

  console.log(`   ✅ ${allRows.length} data rows, ${productEntries.length} unique products\n`);

  // ── Write outputs ──
  const outDir = path.dirname(inputPath);
  const jsonPath = path.join(outDir, "excel-full.json");
  const csvPath = path.join(outDir, "excel-full.csv");
  const namesPath = path.join(outDir, "product-names.json");
  const detailPath = path.join(outDir, "product-names-detail.json");

  // JSON: full dump
  fs.writeFileSync(jsonPath, JSON.stringify(allRows, null, 2));
  console.log(`   Wrote: ${jsonPath}  (${allRows.length} rows)`);

  // CSV: only non-empty columns to keep it manageable
  const usedColIndices = new Set<number>();
  for (const row of allRows) {
    for (let i = 0; i < headers.length; i++) {
      if (row[headers[i]]) usedColIndices.add(i);
    }
  }
  const usedHeaders = headers.filter((_, i) => usedColIndices.has(i));

  const csvLines: string[] = [];
  csvLines.push(usedHeaders.map(csvEscape).join(","));
  for (const row of allRows) {
    csvLines.push(usedHeaders.map((h) => csvEscape(row[h] ?? "")).join(","));
  }
  fs.writeFileSync(csvPath, "\uFEFF" + csvLines.join("\r\n")); // BOM for Excel
  console.log(`   Wrote: ${csvPath}  (${usedHeaders.length} cols × ${allRows.length} rows)`);

  // Product names (compact)
  fs.writeFileSync(namesPath, JSON.stringify(productEntries.map((e) => e.name), null, 2));
  console.log(`   Wrote: ${namesPath}`);

  // Product names (detail)
  fs.writeFileSync(detailPath, JSON.stringify(productEntries, null, 2));
  console.log(`   Wrote: ${detailPath}`);

  // Clean JSON: only non-empty fields per row (much smaller, easier to read)
  const cleanRows = allRows.map((row) => {
    const clean: Record<string, string> = {};
    for (const [key, val] of Object.entries(row)) {
      if (val && val !== "[object Object]") clean[key] = val;
    }
    return clean;
  });
  const cleanPath = path.join(outDir, "excel-clean.json");
  fs.writeFileSync(cleanPath, JSON.stringify(cleanRows, null, 2));
  console.log(`   Wrote: ${cleanPath}  (non-empty fields only)`);

  // ── Also dump lookup sheets (大分類, 中分類, 小分類, etc.) ──
  const lookupSheets = ["大分類", "中分類", "小分類", "在庫取寄区分", "ﾒｰｶｰCD", "単位CD", "仕入先CD", "お客様CD"];
  const lookups: Record<string, { code: string; name: string }[]> = {};
  for (const sheetName of lookupSheets) {
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) continue;
    const entries: { code: string; name: string }[] = [];
    for (let r = 2; r <= ws.rowCount; r++) {
      const code = cellText(ws.getRow(r).getCell(1));
      const name = cellText(ws.getRow(r).getCell(2));
      if (code || name) entries.push({ code, name });
    }
    lookups[sheetName] = entries;
  }
  const lookupPath = path.join(outDir, "excel-lookups.json");
  fs.writeFileSync(lookupPath, JSON.stringify(lookups, null, 2));
  console.log(`   Wrote: ${lookupPath}  (${Object.keys(lookups).length} lookup tables)`);

  // ── Summary ──
  console.log(`\n── Product names (${productEntries.length}) ──────────────────────`);
  productEntries.slice(0, 10).forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.name}  [${e.maker} / ${e.productCode}]`);
  });
  if (productEntries.length > 10) {
    console.log(`  ... and ${productEntries.length - 10} more`);
  }
  console.log(`──────────────────────────────────────────────────`);
}

main().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});