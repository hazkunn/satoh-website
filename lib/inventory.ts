export type Product = {
  slug: string;
  name: string;
  category: string;
  description: string;
  models?: string[];
  specifications?: { label: string; value: string }[];
};

const inventoryDataRaw = [
  {
    category: "油圧機器",
    description: "油圧ポンプ、バルブ、シリンダー、フィルターなど",
    items: [
      "油圧ポンプ（ギヤポンプ、ピストンポンプ、ベーンポンプ）",
      "油圧バルブ（方向制御弁、圧力制御弁、流量制御弁）",
      "油圧シリンダー",
      "油圧フィルター",
      "ホース・継手類",
      "作動油",
      "油圧モーター",
      "油圧ユニット",
      "アキュムレーター",
      "油圧配管部材",
    ],
  },
  {
    category: "空圧機器",
    description: "エアシリンダー、電磁弁、エアフィルターなど",
    items: [
      "エアシリンダー",
      "電磁弁・エアバルブ",
      "エアフィルター・レギュレーター",
      "継手・チューブ",
      "真空機器",
      "エア制御ユニット",
      "エアドライヤー",
      "エアタンク",
      "スピードコントローラー",
      "マニホールド",
    ],
  },
  {
    category: "切削工具",
    description: "ドリル、エンドミル、バイト、研削砥石など",
    items: [
      "ドリル（超硬、ハイス）",
      "エンドミル（スクエア、ボール、ラジアス）",
      "旋削工具（バイト、チップ）",
      "フライス加工工具",
      "研削・研磨工具",
      "測定ゲージ類",
      "リーマ",
      "タップ・ダイス",
      "ブローチ",
      "ホブカッター",
    ],
  },
  {
    category: "機構部品",
    description: "リニアガイド、ボールねじ、ベアリング、チェーンなど",
    items: [
      "リニアガイド",
      "ボールねじ",
      "各種ベアリング",
      "チェーン・スプロケット",
      "カップリング",
      "軸継手・クラッチ",
      "タイミングベルト",
      "リニアブッシュ",
      "キー・ピン",
      "オイルシール",
    ],
  },
  {
    category: "計測機器",
    description: "ノギス、マイクロメーター、ハイトゲージ、三次元測定機など",
    items: [
      "ノギス（デジタル、ダイヤル）",
      "マイクロメーター",
      "ダイヤルゲージ",
      "ハイトゲージ",
      "表面粗さ測定機",
      "三次元測定機",
      "ピンゲージ",
      "プラグゲージ",
      "トルクレンチ",
      "試験機",
    ],
  },
  {
    category: "電気品",
    description: "センサー、スイッチ、リレー、制御機器など",
    items: [
      "各種センサー（光電、近接、圧力）",
      "リミットスイッチ",
      "電磁接触器・リレー",
      "プログラマブルコントローラ",
      "インバーター",
      "配線部材",
      "サーボモーター",
      "温度調節計",
      "カウンター・タイマー",
      "電源装置",
    ],
  },
];

// Build a flat list of all items with their index-based slugs
type FlatItem = { name: string; slug: string; category: string; description: string };
const flatItems: FlatItem[] = [];

inventoryDataRaw.forEach((cat, ci) => {
  cat.items.forEach((item, ii) => {
    // Generate ASCII-only slug: extract English/katakana readings, fallback to index
    const asciiPart = item
      .toLowerCase()
      .replace(/[（）・、\s]+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Use ASCII part if available, otherwise use category-index-item-index
    const slug = asciiPart || `item-${ci}-${ii}`;

    flatItems.push({
      name: item,
      slug,
      category: cat.category,
      description: cat.description,
    });
  });
});

export function getAllCategories() {
  return inventoryDataRaw.map(({ category, description, items }) => ({
    category,
    description,
    items: items.map((item) => {
      const found = flatItems.find((f) => f.name === item);
      return {
        name: item,
        slug: found?.slug ?? "",
        category,
      };
    }),
  }));
}

export function getProductBySlug(slug: string): Product | undefined {
  // Detailed product data for example product
  const detailedProducts: Record<string, Product> = {
    "item-0-0": {
      slug: "item-0-0",
      name: "油圧ポンプ（ギヤポンプ、ピストンポンプ、ベーンポンプ）",
      category: "油圧機器",
      description: "高効率・高信頼性の油圧ポンプを取り揃えております。各種産業機械・建設機械・工作機械に最適な油圧ポンプをご提供いたします。",
      models: [
        "SGP-1A-5-FL",
        "SGP-1A-8-FL",
        "SGP-1A-12-FL",
        "SGP-2A-14-FL",
        "SGP-2A-17-FL",
        "SGP-2A-19-FL",
        "PV2R1-6-F",
        "PV2R1-8-F",
        "PV2R1-10-F",
        "PV2R2-14-F",
        "PV2R2-17-F",
        "PV2R2-19-F",
        "50T-7-FL",
        "50T-12-FL",
        "50T-14-FL",
        "50T-17-FL",
        "50T-19-FL",
        "50T-25-FL",
        "50T-35-FL",
        "50T-50-FL",
      ],
      specifications: [
        { label: "ポンプ形式", value: "ギヤポンプ / ピストンポンプ / ベーンポンプ" },
        { label: "吐出量範囲", value: "1.5 ～ 120 cm³/rev" },
        { label: "最高使用圧力", value: "7 ～ 25 MPa" },
        { label: "回転数範囲", value: "600 ～ 3600 min⁻¹" },
        { label: "使用粘度範囲", value: "20 ～ 300 mm²/s" },
        { label: "使用温度範囲", value: "-20 ～ 80 °C" },
        { label: "フランジ規格", value: "SAE / ISO / JIS" },
        { label: "対応可能メーカー", value: "油研工業、ダイキン、住友精密、川崎重工 など" },
        { label: "用途", value: "産業機械、建設機械、工作機械、プレス機械、射出成形機" },
      ],
    },
  };

  // Check if it's a known detailed product
  if (detailedProducts[slug]) {
    return detailedProducts[slug];
  }

  // For other products, return basic info
  const found = flatItems.find((f) => f.slug === slug);
  if (found) {
    return {
      slug,
      name: found.name,
      category: found.category,
      description: `${found.category}の製品です。詳細についてはお問い合わせください。`,
    };
  }

  return undefined;
}

export function getItemSlugs(): string[] {
  return flatItems.map((f) => f.slug);
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
  description: string;
  descriptionLower: string;
  models: string[];
  modelsLower: string[];
  specs: { label: string; value: string }[];
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
      description: product.description,
      descriptionLower: product.description.toLowerCase(),
      models,
      modelsLower: models.map((m) => m.toLowerCase()),
      specs,
      url: `/inventory/${product.slug}`,
    });

    // Pre-extract brand from specs
    for (const s of specs) {
      if (s.label.includes("メーカー")) {
        brands.push({ productIdx: idx, brandValue: s.value, brandLower: s.value.toLowerCase() });
      }
    }
  }

  _searchIndex = { products, brands };
  return _searchIndex;
}
