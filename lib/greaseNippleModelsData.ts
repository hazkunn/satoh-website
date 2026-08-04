// Auto-generated Grease Nipple model data from excel-clean.json
// Source: 26~39［分類］ﾌﾛｰﾊﾞﾙ　ｸﾞﾘｽﾆｯﾌﾟﾙ.xlsx (Floral grease nipples)
// DO NOT hand-edit — regenerate from Excel via scripts/extractGreaseNippleModels.ts

export type GreaseNippleMaterial = "ステンレス(SUS303)" | "黄銅生地" | "黄銅メッキ付";
export type GreaseNippleShape = "A型" | "B型" | "C型" | "ピンタイプ" | "ボタンヘッド";

export interface GreaseNippleModel {
  /** URL-safe identifier (productCode with / → _) — unique within a series */
  urlCode: string;
  /** Original product code from Excel */
  code: string;
  material: GreaseNippleMaterial;
  shape: GreaseNippleShape;
  /** Thread specification (e.g. PT1/8, M6XP0.75) */
  thread: string;
  /** Catalog number from Excel spec field */
  catalogNumber: string;
  /** Manufacturer model code from Excel spec field */
  modelCode: string;
  /** Additional spec notes (e.g. 全長19.8L) */
  extraSpec: string;
  /** Unit of sale */
  unit: string;
  /** The series slug this model belongs to */
  seriesSlug: string;
}

export const greaseNippleSeries: {
  slug: string;
  name: string;
  material: GreaseNippleMaterial;
  shape: GreaseNippleShape;
}[] = [
  { slug: "floral-sus303-a", name: "ステンレス(SUS303) A型", material: "ステンレス(SUS303)", shape: "A型" },
  { slug: "floral-sus303-b", name: "ステンレス(SUS303) B型", material: "ステンレス(SUS303)", shape: "B型" },
  { slug: "floral-sus303-c", name: "ステンレス(SUS303) C型", material: "ステンレス(SUS303)", shape: "C型" },
  { slug: "floral-sus303-pin", name: "ステンレス(SUS303) ピンタイプ", material: "ステンレス(SUS303)", shape: "ピンタイプ" },
  { slug: "floral-sus303-button", name: "ステンレス(SUS303) ボタンヘッド", material: "ステンレス(SUS303)", shape: "ボタンヘッド" },
  { slug: "floral-brass-a", name: "黄銅生地 A型", material: "黄銅生地", shape: "A型" },
  { slug: "floral-brass-b", name: "黄銅生地 B型", material: "黄銅生地", shape: "B型" },
  { slug: "floral-brass-c", name: "黄銅生地 C型", material: "黄銅生地", shape: "C型" },
  { slug: "floral-brass-button", name: "黄銅生地 ボタンヘッド", material: "黄銅生地", shape: "ボタンヘッド" },
  { slug: "floral-brass-plated-a", name: "黄銅メッキ付 A型", material: "黄銅メッキ付", shape: "A型" },
  { slug: "floral-brass-plated-b", name: "黄銅メッキ付 B型", material: "黄銅メッキ付", shape: "B型" },
  { slug: "floral-brass-plated-c", name: "黄銅メッキ付 C型", material: "黄銅メッキ付", shape: "C型" },
  { slug: "floral-brass-plated-pin", name: "黄銅メッキ付 ピンタイプ", material: "黄銅メッキ付", shape: "ピンタイプ" },
  { slug: "floral-brass-plated-button", name: "黄銅メッキ付 ボタンヘッド", material: "黄銅メッキ付", shape: "ボタンヘッド" },
];

export const greaseNippleShapeDescriptions: Record<GreaseNippleShape, string> = {
  "A型": "直形（ストレート）",
  "B型": "45°曲がり形",
  "C型": "90°曲がり形",
  "ピンタイプ": "ピンタイプ",
  "ボタンヘッド": "ボタンヘッド",
};

export const greaseNippleThreadDescriptions: Record<string, string> = {
  "M6XP0.75": "メートルねじ M6×0.75",
  "M6XP1.0": "メートルねじ M6×1.0",
  "UNF1/4X28": "ユニファイ細目ねじ 1/4-28UNF",
  "PT1/8": "管用テーパねじ PT1/8（R1/8）",
  "PT1/4": "管用テーパねじ PT1/4（R1/4）",
  "PT3/8": "管用テーパねじ PT3/8（R3/8）",
  "PT1/2": "管用テーパねじ PT1/2（R1/2）",
  "PF1/8": "管用平行ねじ PF1/8（G1/8）",
};

export const greaseNippleModelData: GreaseNippleModel[] = [
  // ── ステンレス(SUS303) A型 (floral-sus303-a) ──
  { urlCode: "SGNIAM60.75", code: "SGNIAM60.75", material: "ステンレス(SUS303)", shape: "A型", thread: "M6XP0.75", catalogNumber: "33100106", modelCode: "NGA-6075S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-a" },
  { urlCode: "SGNIAM61.0", code: "SGNIAM61.0", material: "ステンレス(SUS303)", shape: "A型", thread: "M6XP1.0", catalogNumber: "33100105", modelCode: "NGA-610S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-a" },
  { urlCode: "SGNIAU1_428", code: "SGNIAU1/428", material: "ステンレス(SUS303)", shape: "A型", thread: "UNF1/4X28", catalogNumber: "33100108", modelCode: "NGA-0228S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-a" },
  { urlCode: "SGNIA1_8", code: "SGNIA1/8", material: "ステンレス(SUS303)", shape: "A型", thread: "PT1/8", catalogNumber: "33100101", modelCode: "NGA-01S", extraSpec: "全長19.8L", unit: "ヶ", seriesSlug: "floral-sus303-a" },
  { urlCode: "SGNIA1_4", code: "SGNIA1/4", material: "ステンレス(SUS303)", shape: "A型", thread: "PT1/4", catalogNumber: "33100102", modelCode: "NGA-02S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-a" },
  { urlCode: "SGNIA3_8", code: "SGNIA3/8", material: "ステンレス(SUS303)", shape: "A型", thread: "PT3/8", catalogNumber: "33100103", modelCode: "NGA-03S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-a" },

  // ── ステンレス(SUS303) B型 (floral-sus303-b) ──
  { urlCode: "SGNIBM60.75", code: "SGNIBM60.75", material: "ステンレス(SUS303)", shape: "B型", thread: "M6XP0.75", catalogNumber: "33100206", modelCode: "NGB-6075S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-b" },
  { urlCode: "SGNIBM61.0", code: "SGNIBM61.0", material: "ステンレス(SUS303)", shape: "B型", thread: "M6XP1.0", catalogNumber: "33100205", modelCode: "NGB-610S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-b" },
  { urlCode: "SGNIBU1_428", code: "SGNIBU1/428", material: "ステンレス(SUS303)", shape: "B型", thread: "UNF1/4X28", catalogNumber: "33100208", modelCode: "NGB-0228S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-b" },
  { urlCode: "SGNIB1_8", code: "SGNIB1/8", material: "ステンレス(SUS303)", shape: "B型", thread: "PT1/8", catalogNumber: "33100201", modelCode: "NGB-01S", extraSpec: "全長21L", unit: "ヶ", seriesSlug: "floral-sus303-b" },
  { urlCode: "SGNIB1_4", code: "SGNIB1/4", material: "ステンレス(SUS303)", shape: "B型", thread: "PT1/4", catalogNumber: "33100202", modelCode: "NGB-02S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-b" },
  { urlCode: "SGNIB3_8", code: "SGNIB3/8", material: "ステンレス(SUS303)", shape: "B型", thread: "PT3/8", catalogNumber: "33100203", modelCode: "NGB-03S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-b" },

  // ── ステンレス(SUS303) C型 (floral-sus303-c) ──
  { urlCode: "SGNICM60.75", code: "SGNICM60.75", material: "ステンレス(SUS303)", shape: "C型", thread: "M6XP0.75", catalogNumber: "33100306", modelCode: "NGC-6075S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-c" },
  { urlCode: "SGNICM61.0", code: "SGNICM61.0", material: "ステンレス(SUS303)", shape: "C型", thread: "M6XP1.0", catalogNumber: "33100305", modelCode: "NGC-610S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-c" },
  { urlCode: "SGNICU1_428", code: "SGNICU1/428", material: "ステンレス(SUS303)", shape: "C型", thread: "UNF1/4X28", catalogNumber: "33100308", modelCode: "NGC-0228S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-c" },
  { urlCode: "SGNIC1_8", code: "SGNIC1/8", material: "ステンレス(SUS303)", shape: "C型", thread: "PT1/8", catalogNumber: "33100301", modelCode: "NGC-01S", extraSpec: "全長21L", unit: "ヶ", seriesSlug: "floral-sus303-c" },
  { urlCode: "SGNIC1_4", code: "SGNIC1/4", material: "ステンレス(SUS303)", shape: "C型", thread: "PT1/4", catalogNumber: "33100302", modelCode: "NGC-02S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-c" },
  { urlCode: "SGNIC3_8", code: "SGNIC3/8", material: "ステンレス(SUS303)", shape: "C型", thread: "PT3/8", catalogNumber: "33100303", modelCode: "NGC-03S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-c" },

  // ── ステンレス(SUS303) ピンタイプ (floral-sus303-pin) ──
  { urlCode: "SGNIP1_8", code: "SGNIP1/8", material: "ステンレス(SUS303)", shape: "ピンタイプ", thread: "PT1/8", catalogNumber: "33100501", modelCode: "NPY-01S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-pin" },
  { urlCode: "SGNIP1_4", code: "SGNIP1/4", material: "ステンレス(SUS303)", shape: "ピンタイプ", thread: "PT1/4", catalogNumber: "33100502", modelCode: "NPY-02S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-pin" },
  { urlCode: "SGNIBTN3_8", code: "SGNIBTN3/8", material: "ステンレス(SUS303)", shape: "ピンタイプ", thread: "PT3/8", catalogNumber: "33100503", modelCode: "NPY-03S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-pin" },

  // ── ステンレス(SUS303) ボタンヘッド (floral-sus303-button) ──
  { urlCode: "SGNIBTN1_8", code: "SGNIBTN1/8", material: "ステンレス(SUS303)", shape: "ボタンヘッド", thread: "PT1/8", catalogNumber: "33100401", modelCode: "NBH-01S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-button" },
  { urlCode: "SGNIBTN1_4", code: "SGNIBTN1/4", material: "ステンレス(SUS303)", shape: "ボタンヘッド", thread: "PT1/4", catalogNumber: "33100402", modelCode: "NBH-02S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-button" },
  { urlCode: "SGNIBTN3_8", code: "SGNIBTN3/8", material: "ステンレス(SUS303)", shape: "ボタンヘッド", thread: "PT3/8", catalogNumber: "33100403", modelCode: "NBH-03S", extraSpec: "", unit: "ヶ", seriesSlug: "floral-sus303-button" },

  // ── 黄銅生地 A型 (floral-brass-a) ──
  { urlCode: "GNIAM60.75", code: "GNIAM60.75", material: "黄銅生地", shape: "A型", thread: "M6XP0.75", catalogNumber: "33201008", modelCode: "NGA-6075Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIAM61.0", code: "GNIAM61.0", material: "黄銅生地", shape: "A型", thread: "M6XP1.0", catalogNumber: "33201007", modelCode: "NGA-610Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIAU1_428", code: "GNIAU1/428", material: "黄銅生地", shape: "A型", thread: "UNF1/4X28", catalogNumber: "33201010", modelCode: "NGA-0228Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIA1_8", code: "GNIA1/8", material: "黄銅生地", shape: "A型", thread: "PT1/8", catalogNumber: "33201001", modelCode: "NGA-01Y", extraSpec: "全長20L", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIAPF18", code: "GNIAPF18", material: "黄銅生地", shape: "A型", thread: "PF1/8", catalogNumber: "33201002", modelCode: "NGA-11Y", extraSpec: "全長14.3L", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIA1_4", code: "GNIA1/4", material: "黄銅生地", shape: "A型", thread: "PT1/4", catalogNumber: "33201003", modelCode: "NGA-02Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIA3_8", code: "GNIA3/8", material: "黄銅生地", shape: "A型", thread: "PT3/8", catalogNumber: "33201005", modelCode: "NGA-03Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-a" },
  { urlCode: "GNIA1_2", code: "GNIA1/2", material: "黄銅生地", shape: "A型", thread: "PT1/2", catalogNumber: "33201006", modelCode: "NGA-04Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-a" },

  // ── 黄銅生地 B型 (floral-brass-b) ──
  { urlCode: "GNIBM60.75", code: "GNIBM60.75", material: "黄銅生地", shape: "B型", thread: "M6XP0.75", catalogNumber: "33201106", modelCode: "NGB-6075Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-b" },
  { urlCode: "GNIBM61.0", code: "GNIBM61.0", material: "黄銅生地", shape: "B型", thread: "M6XP1.0", catalogNumber: "33201105", modelCode: "NGB-610Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-b" },
  { urlCode: "GNIBU1_428", code: "GNIBU1/428", material: "黄銅生地", shape: "B型", thread: "UNF1/4X28", catalogNumber: "33201108", modelCode: "NGB-0228Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-b" },
  { urlCode: "GNIB1_8", code: "GNIB1/8", material: "黄銅生地", shape: "B型", thread: "PT1/8", catalogNumber: "33201101", modelCode: "NGB-01Y", extraSpec: "全長21L", unit: "ヶ", seriesSlug: "floral-brass-b" },
  { urlCode: "GNIB1_4", code: "GNIB1/4", material: "黄銅生地", shape: "B型", thread: "PT1/4", catalogNumber: "33201002", modelCode: "NGB-02Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-b" },
  { urlCode: "GNIB3_8", code: "GNIB3/8", material: "黄銅生地", shape: "B型", thread: "PT3/8", catalogNumber: "33201103", modelCode: "NGB-03Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-b" },

  // ── 黄銅生地 C型 (floral-brass-c) ──
  { urlCode: "GNICM60.75", code: "GNICM60.75", material: "黄銅生地", shape: "C型", thread: "M6XP0.75", catalogNumber: "33201206", modelCode: "NGC-6075Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-c" },
  { urlCode: "GNICM61.0", code: "GNICM61.0", material: "黄銅生地", shape: "C型", thread: "M6XP1.0", catalogNumber: "33201205", modelCode: "NGC-610Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-c" },
  { urlCode: "GNICU1_428", code: "GNICU1/428", material: "黄銅生地", shape: "C型", thread: "UNF1/4X28", catalogNumber: "33201208", modelCode: "NGC-0228Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-c" },
  { urlCode: "GNIC1_8", code: "GNIC1/8", material: "黄銅生地", shape: "C型", thread: "PT1/8", catalogNumber: "33201201", modelCode: "NGC-01Y", extraSpec: "全長21L", unit: "ヶ", seriesSlug: "floral-brass-c" },
  { urlCode: "GNIC1_4", code: "GNIC1/4", material: "黄銅生地", shape: "C型", thread: "PT1/4", catalogNumber: "33201202", modelCode: "NGC-02Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-c" },
  { urlCode: "GNIC3_8", code: "GNIC3/8", material: "黄銅生地", shape: "C型", thread: "PT3/8", catalogNumber: "33201203", modelCode: "NGC-03Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-c" },

  // ── 黄銅生地 ボタンヘッド (floral-brass-button) ──
  { urlCode: "GNIBTN1_8", code: "GNIBTN1/8", material: "黄銅生地", shape: "ボタンヘッド", thread: "PT1/8", catalogNumber: "33201401", modelCode: "NBH-01Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-button" },
  { urlCode: "GNIBTN1_4", code: "GNIBTN1/4", material: "黄銅生地", shape: "ボタンヘッド", thread: "PT1/4", catalogNumber: "33201403", modelCode: "NBH-02Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-button" },
  { urlCode: "GNIBTN3_8", code: "GNIBTN3/8", material: "黄銅生地", shape: "ボタンヘッド", thread: "PT3/8", catalogNumber: "33201405", modelCode: "NBH-03Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-button" },

  // ── 黄銅メッキ付 A型 (floral-brass-plated-a) ──
  { urlCode: "MGNIAM60.75", code: "MGNIAM60.75", material: "黄銅メッキ付", shape: "A型", thread: "M6XP0.75", catalogNumber: "33200708", modelCode: "NGA-6075K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIAM61.0", code: "MGNIAM61.0", material: "黄銅メッキ付", shape: "A型", thread: "M6XP1.0", catalogNumber: "33200707", modelCode: "NGA-610K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIAU1_428", code: "MGNIAU1/428", material: "黄銅メッキ付", shape: "A型", thread: "UNF1/4X28", catalogNumber: "33200710", modelCode: "NGA-0228K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIA1_8", code: "MGNIA1/8", material: "黄銅メッキ付", shape: "A型", thread: "PT1/8", catalogNumber: "33200701", modelCode: "NGA-01K", extraSpec: "全長20L", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIAPF1_8", code: "MGNIAPF1/8", material: "黄銅メッキ付", shape: "A型", thread: "PF1/8", catalogNumber: "33200702", modelCode: "NGA-11K", extraSpec: "全長14.3L", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIA1_4", code: "MGNIA1/4", material: "黄銅メッキ付", shape: "A型", thread: "PT1/4", catalogNumber: "33200703", modelCode: "NGA-02K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIA3_8", code: "MGNIA3/8", material: "黄銅メッキ付", shape: "A型", thread: "PT3/8", catalogNumber: "33200705", modelCode: "NGA-03K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },
  { urlCode: "MGNIA1_2", code: "MGNIA1/2", material: "黄銅メッキ付", shape: "A型", thread: "PT1/2", catalogNumber: "33200706", modelCode: "NGA-04K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-a" },

  // ── 黄銅メッキ付 B型 (floral-brass-plated-b) ──
  { urlCode: "MGNIBM60.75", code: "MGNIBM60.75", material: "黄銅メッキ付", shape: "B型", thread: "M6XP0.75", catalogNumber: "33200806", modelCode: "NGB-6075K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-b" },
  { urlCode: "MGNIBM61.0", code: "MGNIBM61.0", material: "黄銅メッキ付", shape: "B型", thread: "M6XP1.0", catalogNumber: "33200805", modelCode: "NGB-610K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-b" },
  { urlCode: "MGNIBU1_428", code: "MGNIBU1/428", material: "黄銅メッキ付", shape: "B型", thread: "UNF1/4X28", catalogNumber: "33200808", modelCode: "NGB-0228K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-b" },
  { urlCode: "MGNIB1_8", code: "MGNIB1/8", material: "黄銅メッキ付", shape: "B型", thread: "PT1/8", catalogNumber: "33200801", modelCode: "NGB-01K", extraSpec: "全長21L", unit: "ヶ", seriesSlug: "floral-brass-plated-b" },
  { urlCode: "MGNIB1_4", code: "MGNIB1/4", material: "黄銅メッキ付", shape: "B型", thread: "PT1/4", catalogNumber: "33200802", modelCode: "NGB-02K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-b" },
  { urlCode: "MGNIB3_8", code: "MGNIB3/8", material: "黄銅メッキ付", shape: "B型", thread: "PT3/8", catalogNumber: "33200803", modelCode: "NGB-03K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-b" },

  // ── 黄銅メッキ付 C型 (floral-brass-plated-c) ──
  { urlCode: "MGNICM60.75", code: "MGNICM60.75", material: "黄銅メッキ付", shape: "C型", thread: "M6XP0.75", catalogNumber: "33200906", modelCode: "NGC-6075K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-c" },
  { urlCode: "MGNICM61.0", code: "MGNICM61.0", material: "黄銅メッキ付", shape: "C型", thread: "M6XP1.0", catalogNumber: "33200905", modelCode: "NGC-610K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-c" },
  { urlCode: "MGNICU1_428", code: "MGNICU1/428", material: "黄銅メッキ付", shape: "C型", thread: "UNF1/4X28", catalogNumber: "33200908", modelCode: "NGC-0228K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-c" },
  { urlCode: "MGNIC1_8", code: "MGNIC1/8", material: "黄銅メッキ付", shape: "C型", thread: "PT1/8", catalogNumber: "33200901", modelCode: "NGC-01K", extraSpec: "全長21L", unit: "ヶ", seriesSlug: "floral-brass-plated-c" },
  { urlCode: "MGNIC1_4", code: "MGNIC1/4", material: "黄銅メッキ付", shape: "C型", thread: "PT1/4", catalogNumber: "33200902", modelCode: "NGC-02K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-c" },
  { urlCode: "MGNIC3_8", code: "MGNIC3/8", material: "黄銅メッキ付", shape: "C型", thread: "PT3/8", catalogNumber: "33200903", modelCode: "NGC-03K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-c" },

  // ── 黄銅メッキ付 ピンタイプ (floral-brass-plated-pin) ──
  { urlCode: "MGNIP1_8", code: "MGNIP1/8", material: "黄銅メッキ付", shape: "ピンタイプ", thread: "PT1/8", catalogNumber: "33201501", modelCode: "NPY-01K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-pin" },
  { urlCode: "MGNIP1_4", code: "MGNIP1/4", material: "黄銅メッキ付", shape: "ピンタイプ", thread: "PT1/4", catalogNumber: "33201503", modelCode: "NPY-02K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-pin" },
  { urlCode: "MGNIP3_8", code: "MGNIP3/8", material: "黄銅メッキ付", shape: "ピンタイプ", thread: "PT3/8", catalogNumber: "33201505", modelCode: "NPY-03K", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-pin" },

  // ── 黄銅メッキ付 ボタンヘッド (floral-brass-plated-button) ──
  { urlCode: "MGNIBTN1_8", code: "MGNIBTN1/8", material: "黄銅メッキ付", shape: "ボタンヘッド", thread: "PT1/8", catalogNumber: "33201301", modelCode: "NBH-01Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-button" },
  { urlCode: "MGNIBTN1_4", code: "MGNIBTN1/4", material: "黄銅メッキ付", shape: "ボタンヘッド", thread: "PT1/4", catalogNumber: "33201303", modelCode: "NBH-02Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-button" },
  { urlCode: "MGNIBTN3_8", code: "MGNIBTN3/8", material: "黄銅メッキ付", shape: "ボタンヘッド", thread: "PT3/8", catalogNumber: "33201305", modelCode: "NBH-03Y", extraSpec: "", unit: "ヶ", seriesSlug: "floral-brass-plated-button" },
];