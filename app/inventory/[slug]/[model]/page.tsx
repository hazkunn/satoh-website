import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getModelByCode,
  getModelSpecs,
  getProductSlugsWithModels,
  getModelCodesForSlug,
} from "@/lib/inventory";
import { getStockBySlugAndModel } from "@/lib/loadInventory";

export function generateStaticParams() {
  // Generate params for all models (belts + grease nipples) across all product slugs
  const params: { slug: string; model: string }[] = [];
  for (const slug of getProductSlugsWithModels()) {
    for (const code of getModelCodesForSlug(slug)) {
      params.push({ slug, model: code });
    }
  }
  return params;
}

// Revalidate periodically so stock numbers refresh from R2.
export const revalidate = 300;

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string; model: string }>;
}) {
  const { slug, model } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const modelData = getModelByCode(model);
  const specs = getModelSpecs(model);

  if (!modelData || !specs) {
    notFound();
  }

  // Load stock for this specific model from R2 (cached).
  // May be undefined if R2 is unavailable or no entry exists.
  const stock = await getStockBySlugAndModel(slug, model);
  const hasStockData = stock !== undefined;
  const inStock = hasStockData && stock > 0;

  // Build description based on model type
  let description: string;
  if ("outerLengthInch" in modelData) {
    // Standard V-belt
    description = `三ツ星（Mitsuboshi）スタンダードVベルト ${modelData.code} の仕様詳細ページです。外周長さ ${modelData.outerLengthInch} インチ（${modelData.outerLengthMm} mm）、${modelData.type}形のVベルトです。JIS K6323 規格適合品。`;
  } else if ("nominalSize" in modelData) {
    // SGP welding cap
    const finishDesc = modelData.finish === "黒" ? "黒（素地）" : "白（溶融亜鉛メッキ）";
    description = `FKK製 SGP突合溶接キャップ ${modelData.code} の仕様詳細ページです。A呼称 ${modelData.nominalSize}（管外径 ${modelData.outerDiameterMm} mm）、仕上げ：${finishDesc}。JIS B 2311準拠、JIS G 3452 SGP鋼管用の突合せ溶接式管継手（キャップ）です。`;
  } else if ("sizeNotation" in modelData) {
    // BC ring joint
    const typeDesc = modelData.type === "片口" ? "片口（片側Rねじ＋片側リング継手）" : "両口（両側リング継手）";
    description = `フローバル（Floral）製 BCリング継手 ${modelData.code} の仕様詳細ページです。形状：${typeDesc}、サイズ表記：${modelData.sizeNotation}、銅管外径 ${modelData.pipeOuterDiameterMm} mm。C3604快削黄銅製、リング玉入りの圧縮式ユニオン継手です。最高使用圧力 3.5 MPa。`;
  } else if ("shape" in modelData) {
    // Grease nipple
    description = `フローバル（Floral）グリスニップル ${modelData.code} の仕様詳細ページです。材質：${modelData.material}、形状：${modelData.shape}、ねじ規格：${modelData.thread}。各種産業機械・自動車・建設機械の潤滑部に最適です。`;
  } else if ("catalogNumber" in modelData && "modelCode" in modelData && "thread" in modelData) {
    // Relief nipple
    description = `フローバル（Floral）製リリーフニップル ${modelData.code} の仕様詳細ページです。材質：黄銅メッキ付、ねじ規格：${modelData.thread}。内部リリーフ弁（設定圧力 0.8±0.4 kg）により過給圧を自動逃がしし、軸受・機械の潤滑系統の過圧を防ぎます。`;
  } else {
    // Wedge V-belt
    description = `三ツ星（Mitsuboshi）狭角Vベルト ${modelData.code} の仕様詳細ページです。外周長さ ${modelData.outerLengthMm} mm、${modelData.type}形の狭角Vベルトです。RMAIP規格準拠品。`;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-500 transition-colors">
            ホーム
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <Link
            href="/inventory"
            className="text-sm text-blue-700 hover:text-blue-500 transition-colors"
          >
            商品在庫案内
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <Link
            href={`/inventory/${slug}`}
            className="text-sm text-blue-700 hover:text-blue-500 transition-colors"
          >
            {product.name}
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <span className="text-sm text-gray-600">{modelData.code}</span>
        </div>
      </div>

      {/* Model Detail */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block bg-blue-50 text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
                {product.maker} — {product.series}
              </span>
              <h1 className="font-mincho text-3xl md:text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                {modelData.code}
              </h1>
              <div className="w-10 h-px bg-blue-200 mb-4" />
              <p className="text-lg text-gray-500 mb-2">
                {product.name}
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                {description}
              </p>

              {/* Stock badge */}
              <div className="mt-4">
                {hasStockData ? (
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                      inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        inStock ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {inStock ? `在庫 ${stock} 点` : "在庫切れ"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                    在庫情報はお問い合わせください
                  </span>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
                <h2 className="font-mincho text-lg font-semibold text-white tracking-tight">
                  {modelData.code} 仕様詳細
                </h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    {specs.map((spec, index) => (
                      <tr
                        key={spec.label}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700 w-1/3 border-b border-gray-200">
                          {spec.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 text-center border border-blue-100/60">
              <h3 className="section-heading text-xl text-gray-900 mb-4">
                {modelData.code} についてのお問い合わせ
              </h3>
              <div className="w-10 h-px bg-blue-200 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                在庫確認や見積もりなど、お気軽にお問い合わせください。
              </p>
              <Link
                href={`/inquiry?model=${modelData.code}`}
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                お問い合わせ
              </Link>
            </div>

            {/* Back Links */}
            <div className="mt-8 text-center space-x-4">
              <Link
                href={`/inventory/${slug}`}
                className="text-blue-700 hover:text-blue-500 font-medium transition-colors"
              >
                ← {product.name} に戻る
              </Link>
              <Link
                href="/inventory"
                className="text-blue-700 hover:text-blue-500 font-medium transition-colors"
              >
                ← 商品在庫案内に戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}