/**
 * Quick diagnostic: dump first 10 rows × first 15 cols of the Excel
 * so I can see the actual structure and find where 商品名 lives.
 */
import * as fs from "node:fs";
import ExcelJS from "exceljs";

async function main() {
  const dir = "excel converter (READ ONLY)";
  const file = fs.readdirSync(dir).find((f) => /\.xlsx$/i.test(f))!;
  const inputPath = `${dir}/${file}`;

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(inputPath);

  for (const sheet of wb.worksheets) {
    console.log(`\n===== Sheet: "${sheet.name}"  rows=${sheet.rowCount}  cols=${sheet.columnCount} =====`);

    const maxRow = Math.min(sheet.rowCount, 12);
    const maxCol = Math.min(sheet.columnCount, 15);

    for (let r = 1; r <= maxRow; r++) {
      const row = sheet.getRow(r);
      const cells: string[] = [];
      for (let c = 1; c <= maxCol; c++) {
        const v = row.getCell(c).value;
        let s = "";
        if (v === null || v === undefined) s = "";
        else if (typeof v === "object" && "text" in v) s = String((v as any).text);
        else if (typeof v === "object" && "result" in v) s = String((v as any).result);
        else s = String(v);
        // truncate
        if (s.length > 25) s = s.slice(0, 25) + "…";
        cells.push(`[${c}]${s}`);
      }
      console.log(`Row ${r}: ${cells.join(" | ")}`);
    }

    // Also dump merged cells info
    if (sheet.model?.merges) {
      console.log(`\n  Merged cells (${sheet.model.merges.length}):`);
      for (const m of sheet.model.merges.slice(0, 10)) {
        console.log(`    ${m}`);
      }
    }
  }
}

main().catch(console.error);