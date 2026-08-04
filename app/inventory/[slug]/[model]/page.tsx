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
  const description = "outerLengthInch" in modelData
    ? `三ツ星（Mitsuboshi）スタンダードVベルト ${modelData.code} の仕様詳細ページです。外周長さ ${modelData.outerLengthInch} インチ（${modelData.outerLengthMm} mm）、${modelData.type}形のVベルトです。JIS K6323 規格適合品。`
    : "seriesSlug" in modelData
    ? `フローバル（Floral）グリスニップル ${modelData.code} の仕様詳細ページです。材質：${modelData.material}、形状：${modelData.shape}、ねじ規格：${modelData.thread}。各種産業機械・自動車・建設機械の潤滑部に最適です。`
    : `三ツ星（Mitsuboshi）狭角Vベルト ${modelData.code} の仕様詳細ページです。外周長さ ${modelData.outerLengthMm} mm、${modelData.type}形の狭角Vベルトです。RMAIP規格準拠品。`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-500">
            ホーム
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <Link
            href="/inventory"
            className="text-sm text-blue-700 hover:text-blue-500"
          >
            商品在庫案内
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <Link
            href={`/inventory/${slug}`}
            className="text-sm text-blue-700 hover:text-blue-500"
          >
            {product.name}
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <span className="text-sm text-gray-600">{modelData.code}</span>
        </div>
      </div>

      {/* Model Detail */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                {product.maker} — {product.series}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {modelData.code}
              </h1>
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="bg-blue-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white">
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
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {modelData.code} についてのお問い合わせ
              </h3>
              <p className="text-gray-600 mb-6">
                在庫確認や見積もりなど、お気軽にお問い合わせください。
              </p>
              <Link
                href={`/inquiry?model=${modelData.code}`}
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
              >
                お問い合わせ
              </Link>
            </div>

            {/* Back Links */}
            <div className="mt-8 text-center space-x-4">
              <Link
                href={`/inventory/${slug}`}
                className="text-blue-700 hover:text-blue-500 font-medium"
              >
                ← {product.name} に戻る
              </Link>
              <Link
                href="/inventory"
                className="text-blue-700 hover:text-blue-500 font-medium"
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