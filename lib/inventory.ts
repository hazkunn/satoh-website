// ============================================================
// Static catalog data — curated per product-type
// ============================================================
// Specifications are product-type-specific. A pump has discharge
// range / max pressure / RPM; a bearing has bore / outer diameter /
// dynamic load rating. They share NOTHING, so they must NOT live in
// a single generic R2 blob. Curated details stay in code; only the
// frequently-changing stock count lives in R2.

import { vBeltModelData, type VBeltModel } from "./vBeltModelsData";
import { wedgeBeltModelData, type WedgeBeltModel } from "./wedgeBeltModelsData";
import {
  greaseNippleModelData,
  greaseNippleSeries,
  greaseNippleShapeDescriptions,
  greaseNippleThreadDescriptions,
  type GreaseNippleModel,
} from "./greaseNippleModelsData";
import {
  reliefNippleModelData,
  reliefNippleSeries,
  reliefNippleThreadDescriptions,
  type ReliefNippleModel,
} from "./reliefNippleModelsData";
import {
  ringJointModelData,
  ringJointSeries,
  type RingJointModel,
} from "./ringJointModelsData";
import {
  weldingCapModelData,
  weldingCapSeries,
  type WeldingCapModel,
} from "./weldingCapModelsData";

// Unified belt model type for all belt varieties (V-belt, wedge belt, etc.)
export type BeltModel = VBeltModel | WedgeBeltModel;
export type AnyModel =
  | BeltModel
  | GreaseNippleModel
  | ReliefNippleModel
  | RingJointModel
  | WeldingCapModel;

export type Spec = { label: string; value: string };

export type Product = {
  slug: string;
  name: string;
  category: string;
  maker: string;
  series: string;
  description: string;
  models?: string[];
  specifications?: Spec[];
  stock?: number;
};

// ============================================================
// Inventory listing — real data only
// ============================================================
// Hierarchy: Category → SubCategory → ProductType → Brand → Series
// e.g. 電動機器 → 伝達機器 → Vベルト → 三ツ星 → A形 / B形
//
// All 17 top-level categories are listed. Only 電動機器 has real data
// for now; the rest are placeholders shown as empty categories so the
// structure is clear and future data slots in easily.

type ListingSeries = {
  name: string;
  slug: string;
  series: string;
};

type ListingBrand = {
  brand: string;
  description: string;
  series: ListingSeries[];
};

type ListingProductType = {
  productType: string;
  description: string;
  brands: ListingBrand[];
};

type ListingSubCategory = {
  subCategory: string;
  description: string;
  productTypes: ListingProductType[];
};

type ListingCategory = {
  category: string;
  description: string;
  subCategories: ListingSubCategory[];
};

const inventoryDataRaw: ListingCategory[] = [
  {
    category: "プラント資材",
    description: "プラント設備関連の資材",
    subCategories: [],
  },
  {
    category: "管工器材",
    description: "配管・継手・バルブ等の管工器材",
    subCategories: [
      {
        subCategory: "潤滑継手",
        description: "グリスニップル・リリーフニップル・潤滑継手関連部品",
        productTypes: [
          {
            productType: "グリスニップル",
            description:
              "グリスニップル（ grease nipple ）は、機械の潤滑部にグリスを注入するための継手です。A型（直形）、B型（45°曲がり）、C型（90°曲がり）、ピンタイプ、ボタンヘッドの各形状を取り揃えております。材質はステンレス（SUS303）、黄銅生地、黄銅メッキ付の3種類。",
            brands: [
              {
                brand: "フローバル（Floral）",
                description:
                  "フローバル製グリスニップル。ステンレス（SUS303）、黄銅生地、黄銅メッキ付の3種類の材質を取り揃え。PTねじ、Mねじ、UNFねじ対応。",
                series: greaseNippleSeries.map((s) => ({
                  name: `フローバル グリスニップル ${s.name}`,
                  slug: s.slug,
                  series: s.name,
                })),
              },
            ],
          },
          {
            productType: "リリーフニップル",
            description:
              "リリーフニップル（ relief nipple ）は、グリスニップルの一方で過給圧を自動逃がしする安全機構付きの給脂継手です。軸受・機械の潤滑系統で過圧を防ぎ、適切な給脂量を維持します。黄銅メッキ付材質、PTねじ対応。",
            brands: [
              {
                brand: "フローバル（Floral）",
                description:
                  "フローバル製リリーフニップル。内部リリーフ弁（設定圧力 0.8±0.4 kg）により過給圧を自動逃がし。黄銅メッキ付材質、PT1/8・PT1/4・PT3/8ねじ対応。",
                series: reliefNippleSeries.map((s) => ({
                  name: `フローバル ${s.name}`,
                  slug: s.slug,
                  series: s.name,
                })),
              },
            ],
          },
        ],
      },
      {
        subCategory: "配管継手",
        description: "SGP鋼管用突合せ溶接式管継手（キャップ等）",
        productTypes: [
          {
            productType: "突合溶接キャップ",
            description:
              "突合せ溶接式管継手のキャップは、SGP配管の末端を密閉する溶接式継手です。JIS B 2311（一般配管用鋼製突合せ溶接式管継手）準拠、母材は JIS G 3452 SGP 鋼管。黒（素地）と白（溶融亜鉛メッキ）の2種類を取り揃え、15A～300Aの豊富なサイズ展開。",
            brands: [
              {
                brand: "FKK",
                description:
                  "FKK製 SGP突合せ溶接キャップ。黒（素地・SGPC）と白（溶融亜鉛メッキ・SGPWC）の2仕様。15A～300A、JIS B 2311準拠。",
                series: weldingCapSeries.map((s) => ({
                  name: `FKK ${s.name}`,
                  slug: s.slug,
                  series: s.name,
                })),
              },
            ],
          },
        ],
      },
      {
        subCategory: "銅管継手",
        description: "銅管用リング継手（BC形・圧縮式ユニオン）",
        productTypes: [
          {
            productType: "BCリング継手",
            description:
              "BCリング継手は、銅管・ステンレス管・黄銅管用の圧縮式ユニオン継手です。ナット締めで内部のリング（玉）が管に食い込んで密封され、溶接不要で着脱可能。本体・リング・ナットは快削黄銅 C3604。最高使用圧力 3.5 MPa、使用温度 -20℃～150℃。片口（RUO・片側Rねじ＋片側リング継手）と両口（RUW・両側リング継手）の2種類。",
            brands: [
              {
                brand: "フローバル（Floral）",
                description:
                  "フローバル製 BCリング継手。C3604快削黄銅製、リング玉入り。片口（RUO）は片側Rねじ＋片側リング継手、両口（RUW）は両側リング継手。1/8～1/2ねじ、φ6～φ12.7銅管対応。",
                series: ringJointSeries.map((s) => ({
                  name: `フローバル ${s.name}`,
                  slug: s.slug,
                  series: s.name,
                })),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    category: "電動機器",
    description: "電動機・動力伝達・制御機器等",
    subCategories: [
      {
        subCategory: "伝達機器",
        description: "Vベルト、チェーン、カップリングなど動力伝達部品",
        productTypes: [
          {
            productType: "Vベルト",
            description: "スタンダードVベルト・狭角Vベルト等",
            brands: [
              {
                brand: "三ツ星（Mitsuboshi）",
                description: "三ツ星ベルト製のスタンダードVベルト・狭角Vベルト。JIS K6323規格品。",
                series: [
                  {
                    name: "三ツ星 Vベルト A形",
                    slug: "mitsuboshi-v-belt-a",
                    series: "スタンダードVベルト A形",
                  },
                  {
                    name: "三ツ星 Vベルト B形",
                    slug: "mitsuboshi-v-belt-b",
                    series: "スタンダードVベルト B形",
                  },
                  {
                    name: "三ツ星 狭角Vベルト 3V形",
                    slug: "mitsuboshi-wedge-belt-3v",
                    series: "狭角Vベルト 3V形",
                  },
                  {
                    name: "三ツ星 狭角Vベルト 5V形",
                    slug: "mitsuboshi-wedge-belt-5v",
                    series: "狭角Vベルト 5V形",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    category: "軸受関連商品",
    description: "ベアリング・軸受関連商品",
    subCategories: [],
  },
  {
    category: "油圧・空圧機器",
    description: "油圧・空圧関連機器",
    subCategories: [],
  },
  {
    category: "物流・省力機器",
    description: "物流・省力化関連機器",
    subCategories: [],
  },
  {
    category: "自動化・制御機器",
    description: "自動化・制御関連機器",
    subCategories: [],
  },
  {
    category: "包装機器",
    description: "包装関連機器",
    subCategories: [],
  },
  {
    category: "工作機械・制罐機械",
    description: "工作機械・制罐機械",
    subCategories: [],
  },
  {
    category: "溶接機材",
    description: "溶接関連機材",
    subCategories: [],
  },
  {
    category: "工具類",
    description: "手工具・電動工具等",
    subCategories: [],
  },
  {
    category: "計器・測定器",
    description: "計器・測定機器",
    subCategories: [],
  },
  {
    category: "住設機器",
    description: "住設関連機器",
    subCategories: [],
  },
  {
    category: "環境機器",
    description: "環境関連機器",
    subCategories: [],
  },
  {
    category: "鋼材類",
    description: "鋼材類",
    subCategories: [],
  },
  {
    category: "ネジ類",
    description: "ネジ・ボルト等",
    subCategories: [],
  },
  {
    category: "ホース類",
    description: "各種ホース類",
    subCategories: [],
  },
];

// Build a flat list of all items with their slugs
type FlatItem = {
  name: string;
  slug: string;
  category: string;
  maker: string;
  series: string;
  description: string;
};
const flatItems: FlatItem[] = [];

inventoryDataRaw.forEach((cat) => {
  cat.subCategories.forEach((sub) => {
    sub.productTypes.forEach((pt) => {
      pt.brands.forEach((br) => {
        br.series.forEach((item) => {
          flatItems.push({
            name: item.name,
            slug: item.slug,
            category: cat.category,
            maker: br.brand,
            series: item.series,
            description: sub.description,
          });
        });
      });
    });
  });
});

export function getAllCategories() {
  return inventoryDataRaw.map(({ category, description, subCategories }) => ({
    category,
    description,
    subCategories: subCategories.map((sub) => ({
      subCategory: sub.subCategory,
      description: sub.description,
      productTypes: sub.productTypes.map((pt) => ({
        productType: pt.productType,
        description: pt.description,
        brands: pt.brands.map((br) => ({
          brand: br.brand,
          description: br.description,
          series: br.series.map((item) => {
            const found = flatItems.find((f) => f.slug === item.slug);
            return {
              name: item.name,
              slug: found?.slug ?? item.slug,
              series: item.series,
              brand: br.brand,
              category,
            };
          }),
        })),
      })),
    })),
  }));
}

// ── Generate V-belt model codes (A19–A100, B19–B102) ──────────
const vBeltModelsA: string[] = [];
for (let i = 19; i <= 100; i++) vBeltModelsA.push(`A${i}`);

const vBeltModelsB: string[] = [];
for (let i = 19; i <= 102; i++) vBeltModelsB.push(`B${i}`);

// ── Wedge belt model codes (from wedgeBeltModelData) ──────────
const wedgeBeltModels3V: string[] = wedgeBeltModelData
  .filter((m) => m.type === "3V")
  .map((m) => m.code);
const wedgeBeltModels5V: string[] = wedgeBeltModelData
  .filter((m) => m.type === "5V")
  .map((m) => m.code);

// ============================================================
// Curated product details — specs are product-type-specific
// ============================================================
const detailedProducts: Record<string, Product> = {
  // ── 三ツ星 Vベルト A形 (Mitsuboshi V-belt A-type) ───────────
  "mitsuboshi-v-belt-a": {
    slug: "mitsuboshi-v-belt-a",
    name: "三ツ星 Vベルト A形",
    category: "伝達機器",
    maker: "三ツ星（Mitsuboshi）",
    series: "スタンダードVベルト A形",
    description:
      "三ツ星（Mitsuboshi）スタンダードVベルト A形を豊富に在庫しております。JIS K6323規格品。各種産業機械・農業機械・空調機器の動力伝達に最適です。A19～A100までの豊富なサイズ展開。",
    models: vBeltModelsA,
    specifications: [
      { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
      { label: "ベルト種類", value: "スタンダード Vベルト" },
      { label: "形番", value: "A形" },
      { label: "外周長さ", value: "19 ～ 100 インチ（483 ～ 2540 mm）" },
      { label: "断面寸法（頂幅×高さ）", value: "12.5 mm × 9.0 mm" },
      { label: "角度（θ）", value: "40°" },
      { label: "最小プーリ径", value: "75 mm" },
      { label: "規格", value: "JIS K6323" },
      { label: "単位", value: "本" },
    ],
  },

  // ── 三ツ星 Vベルト B形 (Mitsuboshi V-belt B-type) ───────────
  "mitsuboshi-v-belt-b": {
    slug: "mitsuboshi-v-belt-b",
    name: "三ツ星 Vベルト B形",
    category: "伝達機器",
    maker: "三ツ星（Mitsuboshi）",
    series: "スタンダードVベルト B形",
    description:
      "三ツ星（Mitsuboshi）スタンダードVベルト B形を豊富に在庫しております。JIS K6323規格品。A形より太いベルトで、より高負荷の動力伝達に適しています。B19～B102までの豊富なサイズ展開。",
    models: vBeltModelsB,
    specifications: [
      { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
      { label: "ベルト種類", value: "スタンダード Vベルト" },
      { label: "形番", value: "B形" },
      { label: "外周長さ", value: "19 ～ 102 インチ（483 ～ 2591 mm）" },
      { label: "断面寸法（頂幅×高さ）", value: "16.5 mm × 11.0 mm" },
      { label: "角度（θ）", value: "40°" },
      { label: "最小プーリ径", value: "125 mm" },
      { label: "規格", value: "JIS K6323" },
      { label: "単位", value: "本" },
    ],
  },

  // ── 三ツ星 狭角Vベルト 3V形 (Mitsuboshi Wedge belt 3V) ──────
  "mitsuboshi-wedge-belt-3v": {
    slug: "mitsuboshi-wedge-belt-3v",
    name: "三ツ星 狭角Vベルト 3V形",
    category: "伝達機器",
    maker: "三ツ星（Mitsuboshi）",
    series: "狭角Vベルト 3V形",
    description:
      "三ツ星（Mitsuboshi）狭角Vベルト 3V形を豊富に在庫しております。RMAIP規格準拠品。標準Vベルトより狭い角度と高い許容張力で、コンパクトなプーリ設計が可能です。3V250～3V1400までの豊富なサイズ展開。",
    models: wedgeBeltModels3V,
    specifications: [
      { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
      { label: "ベルト種類", value: "狭角 Vベルト" },
      { label: "形番", value: "3V形" },
      { label: "外周長さ", value: "250 ～ 1400 mm" },
      { label: "断面寸法（頂幅×高さ）", value: "9.7 mm × 8.0 mm" },
      { label: "角度（θ）", value: "36°" },
      { label: "最小プーリ径", value: "67 mm" },
      { label: "規格", value: "RMAIP（JIS K6323 準拠）" },
      { label: "単位", value: "本" },
    ],
  },

  // ── 三ツ星 狭角Vベルト 5V形 (Mitsuboshi Wedge belt 5V) ──────
  "mitsuboshi-wedge-belt-5v": {
    slug: "mitsuboshi-wedge-belt-5v",
    name: "三ツ星 狭角Vベルト 5V形",
    category: "伝達機器",
    maker: "三ツ星（Mitsuboshi）",
    series: "狭角Vベルト 5V形",
    description:
      "三ツ星（Mitsuboshi）狭角Vベルト 5V形を豊富に在庫しております。RMAIP規格準拠品。3V形より太いベルトで、より高負荷の動力伝達に適しています。5V500～5V3550までの豊富なサイズ展開。",
    models: wedgeBeltModels5V,
    specifications: [
      { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
      { label: "ベルト種類", value: "狭角 Vベルト" },
      { label: "形番", value: "5V形" },
      { label: "外周長さ", value: "500 ～ 3550 mm" },
      { label: "断面寸法（頂幅×高さ）", value: "15.8 mm × 13.0 mm" },
      { label: "角度（θ）", value: "38°" },
      { label: "最小プーリ径", value: "151 mm" },
      { label: "規格", value: "RMAIP（JIS K6323 準拠）" },
      { label: "単位", value: "本" },
    ],
  },

  // ── フローバル グリスニップル (Floral grease nipples) ──────
  // Auto-generated from greaseNippleSeries + greaseNippleModelData
  ...Object.fromEntries(
    greaseNippleSeries.map((s) => {
      const models = greaseNippleModelData
        .filter((m) => m.seriesSlug === s.slug)
        .map((m) => m.urlCode);
      const shapeDesc = greaseNippleShapeDescriptions[s.shape];
      return [
        s.slug,
        {
          slug: s.slug,
          name: `フローバル グリスニップル ${s.name}`,
          category: "潤滑継手",
          maker: "フローバル（Floral）",
          series: s.name,
          description: `フローバル（Floral）製グリスニップル ${s.name}（材質：${s.material}、形状：${s.shape}（${shapeDesc}））。PTねじ・Mねじ・UNFねじ対応。各種産業機械・自動車・建設機械の潤滑部に最適です。`,
          models,
          specifications: [
            { label: "メーカー", value: "フローバル（Floral）" },
            { label: "商品種類", value: "グリスニップル" },
            { label: "材質", value: s.material },
            { label: "形状", value: `${s.shape}（${shapeDesc}）` },
            { label: "対応ねじ", value: "PT・M・UNF" },
            { label: "単位", value: "ヶ" },
          ],
        } satisfies Product,
      ];
    })
  ),

  // ── フローバル リリーフニップル (Floral relief nipples) ──────
  // Auto-generated from reliefNippleSeries + reliefNippleModelData
  ...Object.fromEntries(
    reliefNippleSeries.map((s) => {
      const models = reliefNippleModelData
        .filter((m) => m.seriesSlug === s.slug)
        .map((m) => m.urlCode);
      return [
        s.slug,
        {
          slug: s.slug,
          name: `フローバル ${s.name}`,
          category: "潤滑継手",
          maker: "フローバル（Floral）",
          series: s.name,
          description: `フローバル（Floral）製リリーフニップル ${s.name}（材質：${s.material}）。内部リリーフ弁（設定圧力 0.8±0.4 kg）により過給圧を自動逃がしし、軸受・機械の潤滑系統の過圧を防ぎます。PT1/8・PT1/4・PT3/8ねじ対応。`,
          models,
          specifications: [
            { label: "メーカー", value: "フローバル（Floral）" },
            { label: "商品種類", value: "リリーフニップル" },
            { label: "材質", value: s.material },
            { label: "リリーフ圧力", value: "0.8 ± 0.4 kg（0.4～1.2 kg）" },
            { label: "対応ねじ", value: "PT1/8・PT1/4・PT3/8" },
            { label: "単位", value: "ヶ" },
          ],
        } satisfies Product,
      ];
    })
  ),

  // ── フローバル BCリング継手 (Floral BC ring joints) ──────
  // Auto-generated from ringJointSeries + ringJointModelData
  ...Object.fromEntries(
    ringJointSeries.map((s) => {
      const models = ringJointModelData
        .filter((m) => m.seriesSlug === s.slug)
        .map((m) => m.urlCode);
      const typeDesc = s.type === "片口"
        ? "片側Rねじ＋片側リング継手（RUO）"
        : "両側リング継手（RUW）";
      return [
        s.slug,
        {
          slug: s.slug,
          name: `フローバル ${s.name}`,
          category: "銅管継手",
          maker: "フローバル（Floral）",
          series: s.name,
          description: `フローバル（Floral）製 ${s.name}。本体・リング・ナットは快削黄銅 C3604、リング玉入り。ナット締めで管に食い込んで密封される圧縮式ユニオン継手で、溶接不要・着脱可能。${typeDesc}。最高使用圧力 3.5 MPa、使用温度 -20℃～150℃。`,
          models,
          specifications: [
            { label: "メーカー", value: "フローバル（Floral）" },
            { label: "商品種類", value: "BCリング継手" },
            { label: "形状", value: s.type },
            { label: "材質", value: "C3604（快削黄銅）" },
            { label: "最高使用圧力", value: "3.5 MPa" },
            { label: "使用温度", value: "-20℃ ～ 150℃" },
            { label: "適用流体", value: "水・油・空気" },
            { label: "適合管", value: "硬質(H)・半硬質(1/2H)銅管、ステンレス管、黄銅管（肉厚0.8mm以上）" },
            { label: "単位", value: "ヶ" },
          ],
        } satisfies Product,
      ];
    })
  ),

  // ── FKK SGP溶接キャップ (FKK SGP welding caps) ──────
  // Auto-generated from weldingCapSeries + weldingCapModelData
  ...Object.fromEntries(
    weldingCapSeries.map((s) => {
      const models = weldingCapModelData
        .filter((m) => m.seriesSlug === s.slug)
        .map((m) => m.urlCode);
      const finishDesc = s.finish === "黒"
        ? "黒（素地・無メッキ）"
        : "白（溶融亜鉛メッキ・耐食性向上）";
      return [
        s.slug,
        {
          slug: s.slug,
          name: `FKK ${s.name}`,
          category: "配管継手",
          maker: "FKK",
          series: s.name,
          description: `FKK製 ${s.name}。SGP一般配管用鋼管の末端を密閉する突合せ溶接式管継手（キャップ）。JIS B 2311準拠、母材 JIS G 3452 SGP鋼管。仕上げ：${finishDesc}。15A～300Aの豊富なサイズ展開。`,
          models,
          specifications: [
            { label: "メーカー", value: "FKK" },
            { label: "商品種類", value: "突合せ溶接式管継手（キャップ）" },
            { label: "仕上げ", value: finishDesc },
            { label: "規格", value: "JIS B 2311（一般配管用鋼製突合せ溶接式管継手）" },
            { label: "母材", value: "JIS G 3452 SGP 鋼管" },
            { label: "サイズ展開", value: "15A ～ 300A" },
            { label: "単位", value: "ヶ" },
          ],
        } satisfies Product,
      ];
    })
  ),
};

export function getProductBySlug(slug: string): Product | undefined {
  if (detailedProducts[slug]) {
    return detailedProducts[slug];
  }

  const found = flatItems.find((f) => f.slug === slug);
  if (found) {
    return {
      slug,
      name: found.name,
      category: found.category,
      maker: found.maker,
      series: found.series,
      description: `${found.maker}の${found.name}です。詳細についてはお問い合わせください。`,
    };
  }

  return undefined;
}

export function getItemSlugs(): string[] {
  return flatItems.map((f) => f.slug);
}

// ============================================================
// Belt model helpers — per-model specification pages
// (Supports both standard V-belts and wedge V-belts)
// ============================================================

/**
 * Map slug → belt type for the [model] dynamic route.
 */
function slugToBeltType(slug: string): VBeltModel["type"] | WedgeBeltModel["type"] | null {
  if (slug === "mitsuboshi-v-belt-a") return "A";
  if (slug === "mitsuboshi-v-belt-b") return "B";
  if (slug === "mitsuboshi-wedge-belt-3v") return "3V";
  if (slug === "mitsuboshi-wedge-belt-5v") return "5V";
  return null;
}

/**
 * Get belt model data (length, price, stock type) by model code.
 * Searches both V-belt and wedge belt data.
 */
export function getVBeltModelByCode(code: string): BeltModel | undefined {
  const lower = code.toLowerCase();
  return (
    vBeltModelData.find((m) => m.code.toLowerCase() === lower) ??
    wedgeBeltModelData.find((m) => m.code.toLowerCase() === lower)
  );
}

/**
 * Get all belt model codes (V-belt + wedge belt).
 */
export function getAllVBeltModelCodes(): string[] {
  return [...vBeltModelData.map((m) => m.code), ...wedgeBeltModelData.map((m) => m.code)];
}

/**
 * Get belt model codes for a specific product slug.
 */
export function getVBeltModelCodesForSlug(slug: string): string[] {
  const type = slugToBeltType(slug);
  if (!type) return [];
  // Search both data sets
  const fromVBelt = vBeltModelData.filter((m) => m.type === type).map((m) => m.code);
  if (fromVBelt.length > 0) return fromVBelt;
  // Type narrowing: wedge types are "3V" | "5V"
  const wedgeType = type as WedgeBeltModel["type"];
  return wedgeBeltModelData.filter((m) => m.type === wedgeType).map((m) => m.code);
}

/**
 * Get all slugs that have belt model detail pages.
 */
export function getVBeltProductSlugs(): string[] {
  return [
    "mitsuboshi-v-belt-a",
    "mitsuboshi-v-belt-b",
    "mitsuboshi-wedge-belt-3v",
    "mitsuboshi-wedge-belt-5v",
  ];
}

/**
 * Build specifications for a specific belt model.
 * Handles both standard V-belts and wedge V-belts.
 */
export function getVBeltModelSpecs(code: string): Spec[] | undefined {
  const model = getVBeltModelByCode(code);
  if (!model) return undefined;

  // Check if it's a V-belt (has outerLengthInch) or wedge belt
  if ("outerLengthInch" in model) {
    // Standard V-belt
    const sectionDims =
      model.type === "A" ? "12.5 mm × 9.0 mm" : "16.5 mm × 11.0 mm";
    const minPulleyDiameter = model.type === "A" ? "75 mm" : "125 mm";

    return [
      { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
      { label: "商品番号", value: model.code },
      { label: "ベルト種類", value: "スタンダード Vベルト" },
      { label: "形番", value: `${model.type}形` },
      { label: "外周長さ", value: `${model.outerLengthInch} インチ（${model.outerLengthMm} mm）` },
      { label: "断面寸法（頂幅×高さ）", value: sectionDims },
      { label: "角度（θ）", value: "40°" },
      { label: "最小プーリ径", value: minPulleyDiameter },
      { label: "規格", value: "JIS K6323" },
      { label: "単位", value: "本" },
      { label: "在庫区分", value: model.stockType },
    ];
  }

  // Wedge V-belt
  const sectionDims =
    model.type === "3V" ? "9.7 mm × 8.0 mm" : "15.8 mm × 13.0 mm";
  const minPulleyDiameter = model.type === "3V" ? "67 mm" : "151 mm";
  const angle = model.type === "3V" ? "36°" : "38°";

  return [
    { label: "メーカー", value: "三ツ星（Mitsuboshi）" },
    { label: "商品番号", value: model.code },
    { label: "ベルト種類", value: "狭角 Vベルト" },
    { label: "形番", value: `${model.type}形` },
    { label: "外周長さ", value: `${model.outerLengthMm} mm` },
    { label: "断面寸法（頂幅×高さ）", value: sectionDims },
    { label: "角度（θ）", value: angle },
    { label: "最小プーリ径", value: minPulleyDiameter },
    { label: "規格", value: "RMAIP（JIS K6323 準拠）" },
    { label: "単位", value: "本" },
    { label: "在庫区分", value: model.stockType },
  ];
}

// ============================================================
// Generalized model helpers — unified across belts & grease nipples
// ============================================================

/**
 * Check if a slug is a grease nipple series.
 */
function isGreaseNippleSlug(slug: string): boolean {
  return greaseNippleSeries.some((s) => s.slug === slug);
}

/**
 * Check if a slug is a relief nipple series.
 */
function isReliefNippleSlug(slug: string): boolean {
  return reliefNippleSeries.some((s) => s.slug === slug);
}

/**
 * Check if a slug is a ring joint series.
 */
function isRingJointSlug(slug: string): boolean {
  return ringJointSeries.some((s) => s.slug === slug);
}

/**
 * Check if a slug is a welding cap series.
 */
function isWeldingCapSlug(slug: string): boolean {
  return weldingCapSeries.some((s) => s.slug === slug);
}

/**
 * Get grease nipple model by URL code.
 */
export function getGreaseNippleModelByCode(code: string): GreaseNippleModel | undefined {
  const lower = code.toLowerCase();
  return greaseNippleModelData.find((m) => m.urlCode.toLowerCase() === lower);
}

/**
 * Get relief nipple model by URL code.
 */
export function getReliefNippleModelByCode(code: string): ReliefNippleModel | undefined {
  const lower = code.toLowerCase();
  return reliefNippleModelData.find((m) => m.urlCode.toLowerCase() === lower);
}

/**
 * Get ring joint model by URL code.
 */
export function getRingJointModelByCode(code: string): RingJointModel | undefined {
  const lower = code.toLowerCase();
  return ringJointModelData.find((m) => m.urlCode.toLowerCase() === lower);
}

/**
 * Get welding cap model by URL code.
 */
export function getWeldingCapModelByCode(code: string): WeldingCapModel | undefined {
  const lower = code.toLowerCase();
  return weldingCapModelData.find((m) => m.urlCode.toLowerCase() === lower);
}

/**
 * Get model data by code (unified — all product types).
 */
export function getModelByCode(code: string): AnyModel | undefined {
  return (
    getVBeltModelByCode(code) ??
    getGreaseNippleModelByCode(code) ??
    getReliefNippleModelByCode(code) ??
    getRingJointModelByCode(code) ??
    getWeldingCapModelByCode(code)
  );
}

/**
 * Get model data by code, scoped to a specific product slug.
 * This handles cases where the same urlCode appears in multiple series
 * (e.g. SGNIBTN3_8 in both pin-type and button-head SUS303 series).
 */
export function getModelByCodeForSlug(code: string, slug: string): AnyModel | undefined {
  const lower = code.toLowerCase();
  // For grease nipples, filter by seriesSlug first
  if (isGreaseNippleSlug(slug)) {
    return greaseNippleModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
  }
  if (isReliefNippleSlug(slug)) {
    return reliefNippleModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
  }
  if (isRingJointSlug(slug)) {
    return ringJointModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
  }
  if (isWeldingCapSlug(slug)) {
    return weldingCapModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
  }
  // For belts, the global lookup is safe (codes are unique per type)
  return getVBeltModelByCode(code);
}

/**
 * Get model codes for a specific product slug (unified).
 */
export function getModelCodesForSlug(slug: string): string[] {
  if (isGreaseNippleSlug(slug)) {
    return greaseNippleModelData
      .filter((m) => m.seriesSlug === slug)
      .map((m) => m.urlCode);
  }
  if (isReliefNippleSlug(slug)) {
    return reliefNippleModelData
      .filter((m) => m.seriesSlug === slug)
      .map((m) => m.urlCode);
  }
  if (isRingJointSlug(slug)) {
    return ringJointModelData
      .filter((m) => m.seriesSlug === slug)
      .map((m) => m.urlCode);
  }
  if (isWeldingCapSlug(slug)) {
    return weldingCapModelData
      .filter((m) => m.seriesSlug === slug)
      .map((m) => m.urlCode);
  }
  return getVBeltModelCodesForSlug(slug);
}

/**
 * Get all slugs that have model detail pages (unified).
 */
export function getProductSlugsWithModels(): string[] {
  return [
    ...getVBeltProductSlugs(),
    ...greaseNippleSeries.map((s) => s.slug),
    ...reliefNippleSeries.map((s) => s.slug),
    ...ringJointSeries.map((s) => s.slug),
    ...weldingCapSeries.map((s) => s.slug),
  ];
}

/**
 * Build specifications for a specific grease nipple model.
 */
function getGreaseNippleSpecs(gn: GreaseNippleModel): Spec[] {
  const shapeDesc = greaseNippleShapeDescriptions[gn.shape];
  const threadDesc = greaseNippleThreadDescriptions[gn.thread] ?? gn.thread;
  const specs: Spec[] = [
    { label: "メーカー", value: "フローバル（Floral）" },
    { label: "商品番号", value: gn.code },
    { label: "商品種類", value: "グリスニップル" },
    { label: "材質", value: gn.material },
    { label: "形状", value: `${gn.shape}（${shapeDesc}）` },
    { label: "ねじ規格", value: threadDesc },
    { label: "カタログ番号", value: gn.catalogNumber },
    { label: "型番", value: gn.modelCode },
  ];
  if (gn.extraSpec) {
    specs.push({ label: "備考", value: gn.extraSpec });
  }
  specs.push({ label: "単位", value: gn.unit });
  return specs;
}

/**
 * Build specifications for a specific relief nipple model.
 */
function getReliefNippleSpecs(rn: ReliefNippleModel): Spec[] {
  const threadDesc = reliefNippleThreadDescriptions[rn.thread] ?? rn.thread;
  return [
    { label: "メーカー", value: "フローバル（Floral）" },
    { label: "商品番号", value: rn.code },
    { label: "商品種類", value: "リリーフニップル" },
    { label: "材質", value: "黄銅メッキ付" },
    { label: "ねじ規格", value: threadDesc },
    { label: "リリーフ圧力", value: "0.8 ± 0.4 kg（0.4～1.2 kg）" },
    { label: "カタログ番号", value: rn.catalogNumber },
    { label: "型番", value: rn.modelCode },
    { label: "単位", value: rn.unit },
  ];
}

/**
 * Build specifications for a specific ring joint model.
 */
function getRingJointSpecs(rj: RingJointModel): Spec[] {
  const typeDesc = rj.type === "片口"
    ? "片口（片側Rねじ＋片側リング継手 / RUO）"
    : "両口（両側リング継手 / RUW）";
  const specs: Spec[] = [
    { label: "メーカー", value: "フローバル（Floral）" },
    { label: "商品番号", value: rj.code },
    { label: "商品種類", value: "BCリング継手" },
    { label: "形状", value: typeDesc },
    { label: "サイズ表記", value: rj.sizeNotation },
    { label: "ねじ寸法", value: `G${rj.threadSize}` },
    { label: "銅管外径", value: `${rj.pipeOuterDiameterMm} mm` },
    { label: "材質", value: "C3604（快削黄銅）" },
    { label: "最高使用圧力", value: "3.5 MPa" },
    { label: "使用温度", value: "-20℃ ～ 150℃" },
    { label: "適用流体", value: "水・油・空気" },
    { label: "カタログ番号", value: rj.catalogNumber },
    { label: "型番", value: rj.modelCode },
  ];
  if (rj.extraSpec) {
    specs.push({ label: "備考", value: rj.extraSpec });
  }
  specs.push({ label: "単位", value: rj.unit });
  return specs;
}

/**
 * Build specifications for a specific welding cap model.
 */
function getWeldingCapSpecs(wc: WeldingCapModel): Spec[] {
  const finishDesc = wc.finish === "黒"
    ? "黒（素地・無メッキ）"
    : "白（溶融亜鉛メッキ・耐食性向上）";
  return [
    { label: "メーカー", value: "FKK" },
    { label: "商品番号", value: wc.code },
    { label: "商品種類", value: "突合せ溶接式管継手（キャップ）" },
    { label: "仕上げ", value: finishDesc },
    { label: "A呼称", value: wc.nominalSize },
    { label: "呼び径（インチ）", value: wc.inchNotation },
    { label: "管外径", value: `${wc.outerDiameterMm} mm` },
    { label: "規格", value: "JIS B 2311（一般配管用鋼製突合せ溶接式管継手）" },
    { label: "母材", value: "JIS G 3452 SGP 鋼管" },
    { label: "単位", value: wc.unit },
  ];
}

/**
 * Build specifications for a specific model (unified).
 * Handles V-belts, wedge belts, grease nipples, relief nipples,
 * ring joints, and welding caps.
 * Note: For series with duplicate urlCodes across series,
 * use getModelSpecsForSlug instead.
 */
export function getModelSpecs(code: string): Spec[] | undefined {
  // Try grease nipple first (urlCode), then new product types, then belts
  const gn = getGreaseNippleModelByCode(code);
  if (gn) return getGreaseNippleSpecs(gn);

  const rn = getReliefNippleModelByCode(code);
  if (rn) return getReliefNippleSpecs(rn);

  const rj = getRingJointModelByCode(code);
  if (rj) return getRingJointSpecs(rj);

  const wc = getWeldingCapModelByCode(code);
  if (wc) return getWeldingCapSpecs(wc);

  return getVBeltModelSpecs(code);
}

/**
 * Build specifications for a specific model, scoped to a product slug.
 * This handles cases where the same urlCode appears in multiple series.
 */
export function getModelSpecsForSlug(code: string, slug: string): Spec[] | undefined {
  const lower = code.toLowerCase();
  if (isGreaseNippleSlug(slug)) {
    const gn = greaseNippleModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
    if (gn) return getGreaseNippleSpecs(gn);
    return undefined;
  }
  if (isReliefNippleSlug(slug)) {
    const rn = reliefNippleModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
    if (rn) return getReliefNippleSpecs(rn);
    return undefined;
  }
  if (isRingJointSlug(slug)) {
    const rj = ringJointModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
    if (rj) return getRingJointSpecs(rj);
    return undefined;
  }
  if (isWeldingCapSlug(slug)) {
    const wc = weldingCapModelData.find(
      (m) => m.urlCode.toLowerCase() === lower && m.seriesSlug === slug
    );
    if (wc) return getWeldingCapSpecs(wc);
    return undefined;
  }
  return getVBeltModelSpecs(code);
}

// ============================================================
// Precomputed search index — built once at module load time
// ============================================================

export type IndexedProduct = {
  slug: string;
  name: string;
  nameLower: string;
  category: string;
  categoryLower: string;
  maker: string;
  makerLower: string;
  series: string;
  seriesLower: string;
  description: string;
  descriptionLower: string;
  models: string[];
  modelsLower: string[];
  specs: Spec[];
  url: string;
};

type BrandEntry = { productIdx: number; brandValue: string; brandLower: string };

let _searchIndex: { products: IndexedProduct[]; brands: BrandEntry[] } | null = null;

export function getSearchIndex(): { products: IndexedProduct[]; brands: BrandEntry[] } {
  if (_searchIndex) return _searchIndex;

  const products: IndexedProduct[] = [];
  const brands: BrandEntry[] = [];

  for (const f of flatItems) {
    const product = getProductBySlug(f.slug);
    if (!product) continue;

    const idx = products.length;
    const models = product.models ?? [];
    const specs = product.specifications ?? [];

    products.push({
      slug: product.slug,
      name: product.name,
      nameLower: product.name.toLowerCase(),
      category: product.category,
      categoryLower: product.category.toLowerCase(),
      maker: product.maker,
      makerLower: product.maker.toLowerCase(),
      series: product.series,
      seriesLower: product.series.toLowerCase(),
      description: product.description,
      descriptionLower: product.description.toLowerCase(),
      models,
      modelsLower: models.map((m) => m.toLowerCase()),
      specs,
      url: `/inventory/${product.slug}`,
    });

    for (const s of specs) {
      if (s.label.includes("メーカー")) {
        brands.push({ productIdx: idx, brandValue: s.value, brandLower: s.value.toLowerCase() });
      }
    }
  }

  _searchIndex = { products, brands };
  return _searchIndex;
}

/**
 * Async search index — uses static specs/models (the source of truth
 * for catalog content). Stock is not part of search.
 */
export async function getSearchIndexAsync(): Promise<{
  products: IndexedProduct[];
  brands: BrandEntry[];
}> {
  return getSearchIndex();
}