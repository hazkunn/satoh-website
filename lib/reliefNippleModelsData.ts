// Auto-generated Relief Nipple model data from Excel
// Source: 40［分類］ﾌﾛｰﾊﾞﾙ　ﾘﾘｰﾌﾆｯﾌﾟﾙ.xlsx (Floral relief nipples)
// DO NOT hand-edit — regenerate from Excel via scripts/extractReliefNippleModels.ts

export interface ReliefNippleModel {
  /** URL-safe identifier (productCode with / → _) — unique within the series */
  urlCode: string;
  /** Original product code from Excel */
  code: string;
  /** Thread specification (e.g. PT1/8, PT1/4, PT3/8) */
  thread: string;
  /** Catalog number from Excel spec field */
  catalogNumber: string;
  /** Manufacturer model code from Excel spec field */
  modelCode: string;
  /** Unit of sale */
  unit: string;
  /** The series slug this model belongs to */
  seriesSlug: string;
}

export const reliefNippleSeries: {
  slug: string;
  name: string;
  material: string;
}[] = [
  { slug: "floral-relief-nipple-brass-plated", name: "黄銅メッキ付 リリーフニップル", material: "黄銅メッキ付" },
];

export const reliefNippleThreadDescriptions: Record<string, string> = {
  "PT1/8": "管用テーパねじ PT1/8（R1/8）",
  "PT1/4": "管用テーパねじ PT1/4（R1/4）",
  "PT3/8": "管用テーパねじ PT3/8（R3/8）",
};

export const reliefNippleModelData: ReliefNippleModel[] = [
  // ── 黄銅メッキ付 リリーフニップル (floral-relief-nipple-brass-plated) ──
  { urlCode: "MRRFNI1_8", code: "MRRFNI1/8", thread: "PT1/8", catalogNumber: "33201601", modelCode: "NRN-01K", unit: "ヶ", seriesSlug: "floral-relief-nipple-brass-plated" },
  { urlCode: "MRRFNI1_4", code: "MRRFNI1/4", thread: "PT1/4", catalogNumber: "33201602", modelCode: "NRN-02K", unit: "ヶ", seriesSlug: "floral-relief-nipple-brass-plated" },
  { urlCode: "MRRFNI3_8", code: "MRRFNI3/8", thread: "PT3/8", catalogNumber: "33201603", modelCode: "NRN-03K", unit: "ヶ", seriesSlug: "floral-relief-nipple-brass-plated" },
];
