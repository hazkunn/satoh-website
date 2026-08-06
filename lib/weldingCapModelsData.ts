// Auto-generated SGP Welding Cap model data from Excel
// Source: 89~90［分類］SGP・SGPW　溶接ｷｬｯﾌﾟ.xlsx (FKK SGP butt-welding caps)
// DO NOT hand-edit — regenerate from Excel via scripts/extractWeldingCapModels.ts

export type WeldingCapFinish = "黒" | "白";

export interface WeldingCapModel {
  /** URL-safe identifier (productCode) — unique within the series */
  urlCode: string;
  /** Original product code from Excel */
  code: string;
  /** Finish: 黒 (black, bare steel) or 白 (white, hot-dip galvanized) */
  finish: WeldingCapFinish;
  /** Nominal size (A呼称) string, e.g. "15A", "300A" */
  nominalSize: string;
  /** Nominal size as integer (15, 20, 25, ...) */
  nominalSizeA: number;
  /** Pipe outer diameter in mm (JIS G 3452 SGP) */
  outerDiameterMm: number;
  /** Inch approximation from Excel spec field */
  inchNotation: string;
  /** Unit of sale */
  unit: string;
  /** The series slug this model belongs to */
  seriesSlug: string;
}

export const weldingCapSeries: {
  slug: string;
  name: string;
  finish: WeldingCapFinish;
}[] = [
  { slug: "fkk-sgp-welding-cap-black", name: "SGP黒 突合溶接キャップ", finish: "黒" },
  { slug: "fkk-sgp-welding-cap-white", name: "SGP白 突合溶接キャップ", finish: "白" },
];

/** A呼称 → SGP pipe outer diameter (mm), per JIS G 3452 */
export const sgpOuterDiameters: Record<number, number> = {
  15: 21.7,
  20: 27.2,
  25: 34.0,
  32: 42.7,
  40: 48.6,
  50: 60.5,
  65: 76.3,
  80: 89.1,
  100: 114.3,
  125: 139.8,
  150: 165.2,
  200: 216.3,
  300: 318.5,
};

export const weldingCapModelData: WeldingCapModel[] = [
  // ── SGP黒 突合溶接キャップ (fkk-sgp-welding-cap-black / SGPC) ──
  { urlCode: "SGPC15", code: "SGPC15", finish: "黒", nominalSize: "15A", nominalSizeA: 15, outerDiameterMm: 21.7, inchNotation: "1/2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC20", code: "SGPC20", finish: "黒", nominalSize: "20A", nominalSizeA: 20, outerDiameterMm: 27.2, inchNotation: "3/4", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC25", code: "SGPC25", finish: "黒", nominalSize: "25A", nominalSizeA: 25, outerDiameterMm: 34.0, inchNotation: "1", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC32", code: "SGPC32", finish: "黒", nominalSize: "32A", nominalSizeA: 32, outerDiameterMm: 42.7, inchNotation: "1-1/4", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC40", code: "SGPC40", finish: "黒", nominalSize: "40A", nominalSizeA: 40, outerDiameterMm: 48.6, inchNotation: "1-1/2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC50", code: "SGPC50", finish: "黒", nominalSize: "50A", nominalSizeA: 50, outerDiameterMm: 60.5, inchNotation: "2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC65", code: "SGPC65", finish: "黒", nominalSize: "65A", nominalSizeA: 65, outerDiameterMm: 76.3, inchNotation: "2-1/2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC80", code: "SGPC80", finish: "黒", nominalSize: "80A", nominalSizeA: 80, outerDiameterMm: 89.1, inchNotation: "3", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC100", code: "SGPC100", finish: "黒", nominalSize: "100A", nominalSizeA: 100, outerDiameterMm: 114.3, inchNotation: "4", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC125", code: "SGPC125", finish: "黒", nominalSize: "125A", nominalSizeA: 125, outerDiameterMm: 139.8, inchNotation: "5", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC150", code: "SGPC150", finish: "黒", nominalSize: "150A", nominalSizeA: 150, outerDiameterMm: 165.2, inchNotation: "6", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC200", code: "SGPC200", finish: "黒", nominalSize: "200A", nominalSizeA: 200, outerDiameterMm: 216.3, inchNotation: "8", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },
  { urlCode: "SGPC300", code: "SGPC300", finish: "黒", nominalSize: "300A", nominalSizeA: 300, outerDiameterMm: 318.5, inchNotation: "12", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-black" },

  // ── SGP白 突合溶接キャップ (fkk-sgp-welding-cap-white / SGPWC) ──
  { urlCode: "SGPWC15", code: "SGPWC15", finish: "白", nominalSize: "15A", nominalSizeA: 15, outerDiameterMm: 21.7, inchNotation: "1/2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC20", code: "SGPWC20", finish: "白", nominalSize: "20A", nominalSizeA: 20, outerDiameterMm: 27.2, inchNotation: "3/4", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC25", code: "SGPWC25", finish: "白", nominalSize: "25A", nominalSizeA: 25, outerDiameterMm: 34.0, inchNotation: "1", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC32", code: "SGPWC32", finish: "白", nominalSize: "32A", nominalSizeA: 32, outerDiameterMm: 42.7, inchNotation: "1-1/4", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC40", code: "SGPWC40", finish: "白", nominalSize: "40A", nominalSizeA: 40, outerDiameterMm: 48.6, inchNotation: "1-1/2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC50", code: "SGPWC50", finish: "白", nominalSize: "50A", nominalSizeA: 50, outerDiameterMm: 60.5, inchNotation: "2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC65", code: "SGPWC65", finish: "白", nominalSize: "65A", nominalSizeA: 65, outerDiameterMm: 76.3, inchNotation: "2-1/2", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC80", code: "SGPWC80", finish: "白", nominalSize: "80A", nominalSizeA: 80, outerDiameterMm: 89.1, inchNotation: "3", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC100", code: "SGPWC100", finish: "白", nominalSize: "100A", nominalSizeA: 100, outerDiameterMm: 114.3, inchNotation: "4", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC125", code: "SGPWC125", finish: "白", nominalSize: "125A", nominalSizeA: 125, outerDiameterMm: 139.8, inchNotation: "5", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC150", code: "SGPWC150", finish: "白", nominalSize: "150A", nominalSizeA: 150, outerDiameterMm: 165.2, inchNotation: "6", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC200", code: "SGPWC200", finish: "白", nominalSize: "200A", nominalSizeA: 200, outerDiameterMm: 216.3, inchNotation: "8", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
  { urlCode: "SGPWC300", code: "SGPWC300", finish: "白", nominalSize: "300A", nominalSizeA: 300, outerDiameterMm: 318.5, inchNotation: "10", unit: "ヶ", seriesSlug: "fkk-sgp-welding-cap-white" },
];
