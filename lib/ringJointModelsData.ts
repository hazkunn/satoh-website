// Auto-generated BC Ring Joint model data from Excel
// Source: 42~43［分類］BC　ﾘﾝｸﾞｼﾞｮｲﾝﾄ.xlsx (Floral BC ring joints)
// DO NOT hand-edit — regenerate from Excel via scripts/extractRingJointModels.ts

export type RingJointType = "片口" | "両口";

export interface RingJointModel {
  /** URL-safe identifier (productCode with / → _) — unique within the series */
  urlCode: string;
  /** Original product code from Excel */
  code: string;
  /** Joint type: 片口 (one-side, RUO) or 両口 (both-side, RUW) */
  type: RingJointType;
  /** Thread specification string from the product name (e.g. "1/8X 6", "φ6 (1/4)") */
  sizeNotation: string;
  /** G thread size (e.g. 1/8, 1/4, 3/8, 1/2) — for 片口; for 両口 the connecting thread */
  threadSize: string;
  /** Copper pipe outer diameter in mm (e.g. 6, 8, 10, 12) */
  pipeOuterDiameterMm: number;
  /** Catalog number from Excel spec field */
  catalogNumber: string;
  /** Manufacturer model code from Excel spec field */
  modelCode: string;
  /** Additional spec notes (e.g. リング玉入り) */
  extraSpec: string;
  /** Unit of sale */
  unit: string;
  /** The series slug this model belongs to */
  seriesSlug: string;
}

export const ringJointSeries: {
  slug: string;
  name: string;
  type: RingJointType;
}[] = [
  { slug: "floral-bc-ring-joint-one-side", name: "BC 片口 リング継手 ストレート", type: "片口" },
  { slug: "floral-bc-ring-joint-both-side", name: "BC 両口 リング継手 ストレート", type: "両口" },
];

export const ringJointModelData: RingJointModel[] = [
  // ── BC 片口 リング継手 ストレート (floral-bc-ring-joint-one-side / RUO) ──
  { urlCode: "BCKRJ1_86", code: "BCKRJ1/86", type: "片口", sizeNotation: "1/8X 6", threadSize: "1/8", pipeOuterDiameterMm: 6, catalogNumber: "07200104", modelCode: "RUO-0106", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_46", code: "BCKRJ1/46", type: "片口", sizeNotation: "1/4X 6", threadSize: "1/4", pipeOuterDiameterMm: 6, catalogNumber: "07200108", modelCode: "RUO-0206", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_48", code: "BCKRJ1/48", type: "片口", sizeNotation: "1/4X 8", threadSize: "1/4", pipeOuterDiameterMm: 8, catalogNumber: "07200110", modelCode: "RUO-0208", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_410", code: "BCKRJ1/410", type: "片口", sizeNotation: "1/4X 10", threadSize: "1/4", pipeOuterDiameterMm: 10, catalogNumber: "07200112", modelCode: "RUO-0210", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_46.35", code: "BCKRJ1/46.35", type: "片口", sizeNotation: "1/4X 6.35", threadSize: "1/4", pipeOuterDiameterMm: 6.35, catalogNumber: "07200109", modelCode: "RUO-0282", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ3_88", code: "BCKRJ3/88", type: "片口", sizeNotation: "3/8X 8", threadSize: "3/8", pipeOuterDiameterMm: 8, catalogNumber: "07200115", modelCode: "RUO-0338", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ3_810", code: "BCKRJ3/810", type: "片口", sizeNotation: "3/8X 10", threadSize: "3/8", pipeOuterDiameterMm: 10, catalogNumber: "07200117", modelCode: "RUO-0310", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ3_812", code: "BCKRJ3/812", type: "片口", sizeNotation: "3/8X 12", threadSize: "3/8", pipeOuterDiameterMm: 12, catalogNumber: "07200118", modelCode: "RUO-0312", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ3_89.53", code: "BCKRJ3/89.53", type: "片口", sizeNotation: "3/8X 9.53", threadSize: "3/8", pipeOuterDiameterMm: 9.53, catalogNumber: "07200116", modelCode: "RUO-0383", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_28", code: "BCKRJ1/28", type: "片口", sizeNotation: "1/2X 8", threadSize: "1/2", pipeOuterDiameterMm: 8, catalogNumber: "07200121", modelCode: "RUO-0408", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_210", code: "BCKRJ1/210", type: "片口", sizeNotation: "1/2X 10", threadSize: "1/2", pipeOuterDiameterMm: 10, catalogNumber: "07200123", modelCode: "RUO-0410", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_212", code: "BCKRJ1/212", type: "片口", sizeNotation: "1/2X 12", threadSize: "1/2", pipeOuterDiameterMm: 12, catalogNumber: "07200124", modelCode: "RUO-0412", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },
  { urlCode: "BCKRJ1_212.7", code: "BCKRJ1/212.7", type: "片口", sizeNotation: "1/2X 12.7", threadSize: "1/2", pipeOuterDiameterMm: 12.7, catalogNumber: "07200125", modelCode: "RUO-0484", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-one-side" },

  // ── BC 両口 リング継手 ストレート (floral-bc-ring-joint-both-side / RUW) ──
  { urlCode: "BCRRJ6", code: "BCRRJ6", type: "両口", sizeNotation: "φ6 (1/4)", threadSize: "1/4", pipeOuterDiameterMm: 6, catalogNumber: "07200134", modelCode: "RUW-26", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-both-side" },
  { urlCode: "BCRRJ8", code: "BCRRJ8", type: "両口", sizeNotation: "φ8 (1/4)", threadSize: "1/4", pipeOuterDiameterMm: 8, catalogNumber: "07200136", modelCode: "RUW-08", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-both-side" },
  { urlCode: "BCRRJ10", code: "BCRRJ10", type: "両口", sizeNotation: "φ10 (3/8)", threadSize: "3/8", pipeOuterDiameterMm: 10, catalogNumber: "07200138", modelCode: "RUW-10", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-both-side" },
  { urlCode: "BCRRJ12", code: "BCRRJ12", type: "両口", sizeNotation: "φ12 (1/2)", threadSize: "1/2", pipeOuterDiameterMm: 12, catalogNumber: "07200139", modelCode: "RUW-12", extraSpec: "リング玉入り", unit: "ヶ", seriesSlug: "floral-bc-ring-joint-both-side" },
];
