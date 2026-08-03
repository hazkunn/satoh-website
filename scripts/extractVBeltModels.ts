// Extract per-model data from excel-clean.json for Mitsuboshi V-belts
import fs from "fs";
import path from "path";

interface ExcelRow {
  商品CD: string;
  商品名: string;
  小分類名: string;
  "定価(税抜)": string;
  "価格1(税抜)": string;
  "価格2(税抜)": string;
  在庫取寄区分名: string;
}

const dataPath = path.join(
  process.cwd(),
  "excel converter (READ ONLY)",
  "excel-clean.json"
);
const data: ExcelRow[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Filter V-belt rows (A and B types)
const vBeltRows = data.filter(
  (r) => r.小分類名 === "Vﾍﾞﾙﾄ A" || r.小分類名 === "Vﾍﾞﾙﾄ B"
);

interface ModelInfo {
  code: string;
  type: "A" | "B";
  outerLengthInch: number;
  outerLengthMm: number;
  listPrice: number;
  price1: number;
  price2: number;
  stockType: string;
}

// A形: 12.5mm × 9.0mm, B形: 16.5mm × 11.0mm
// V-belt outer circumference = model number in inches
const models: ModelInfo[] = vBeltRows.map((row) => {
  const code = row.商品CD;
  const type = code.startsWith("A") ? "A" : "B";
  const inch = parseInt(code.replace(/^[AB]/, ""), 10);
  return {
    code,
    type,
    outerLengthInch: inch,
    outerLengthMm: Math.round(inch * 25.4),
    listPrice: parseInt(row["定価(税抜)"], 10),
    price1: parseInt(row["価格1(税抜)"], 10),
    price2: parseInt(row["価格2(税抜)"], 10),
    stockType: row.在庫取寄区分名,
  };
});

// Output as TS snippet
const lines = models.map(
  (m) =>
    `  { code: "${m.code}", type: "${m.type}", outerLengthInch: ${m.outerLengthInch}, outerLengthMm: ${m.outerLengthMm}, listPrice: ${m.listPrice}, price1: ${m.price1}, price2: ${m.price2}, stockType: "${m.stockType}" }`
);

const output = `// Auto-generated V-belt model data from excel-clean.json
export interface VBeltModel {
  code: string;
  type: "A" | "B";
  outerLengthInch: number;
  outerLengthMm: number;
  listPrice: number;
  price1: number;
  price2: number;
  stockType: string;
}

export const vBeltModelData: VBeltModel[] = [
${lines.join(",\n")}
];
`;

const outPath = path.join(process.cwd(), "lib", "vBeltModelsData.ts");
fs.writeFileSync(outPath, output, "utf8");
console.log(`Written ${models.length} models to ${outPath}`);
console.log(`A-types: ${models.filter((m) => m.type === "A").length}`);
console.log(`B-types: ${models.filter((m) => m.type === "B").length}`);