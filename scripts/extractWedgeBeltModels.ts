// Extract per-model data from excel-clean.json for Mitsuboshi Wedge V-belts (3V/5V)
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

// Filter Wedge V-belt rows (3V and 5V types)
const wedgeRows = data.filter(
  (r) => r.小分類名 === "ｳｪｯｼﾞﾍﾞﾙﾄ 3V" || r.小分類名 === "ｳｪｯｼﾞﾍﾞﾙﾄ 5V"
);

interface WedgeModelInfo {
  code: string;
  type: "3V" | "5V";
  outerLengthMm: number;
  listPrice: number;
  price1: number;
  price2: number;
  stockType: string;
}

const models: WedgeModelInfo[] = wedgeRows.map((row) => {
  const code = row.商品CD;
  const type = code.startsWith("3V") ? "3V" : "5V";
  const mm = parseInt(code.replace(/^[35]V/, ""), 10);
  return {
    code,
    type,
    outerLengthMm: mm,
    listPrice: parseInt(row["定価(税抜)"], 10),
    price1: parseInt(row["価格1(税抜)"], 10),
    price2: parseInt(row["価格2(税抜)"], 10),
    stockType: row.在庫取寄区分名,
  };
});

// Output as TS snippet
const lines = models.map(
  (m) =>
    `  { code: "${m.code}", type: "${m.type}", outerLengthMm: ${m.outerLengthMm}, listPrice: ${m.listPrice}, price1: ${m.price1}, price2: ${m.price2}, stockType: "${m.stockType}" }`
);

const output = `// Auto-generated Wedge V-belt model data from excel-clean.json (3V/5V)
export interface WedgeBeltModel {
  code: string;
  type: "3V" | "5V";
  outerLengthMm: number;
  listPrice: number;
  price1: number;
  price2: number;
  stockType: string;
}

export const wedgeBeltModelData: WedgeBeltModel[] = [
${lines.join(",\n")}
];
`;

const outPath = path.join(process.cwd(), "lib", "wedgeBeltModelsData.ts");
fs.writeFileSync(outPath, output, "utf8");
console.log(`Written ${models.length} models to ${outPath}`);
console.log(`3V-types: ${models.filter((m) => m.type === "3V").length}`);
console.log(`5V-types: ${models.filter((m) => m.type === "5V").length}`);