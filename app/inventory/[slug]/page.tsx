import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getItemSlugs,
  getModelByCodeForSlug,
} from "@/lib/inventory";
import { getAllStockForSlug } from "@/lib/loadInventory";

export function generateStaticParams() {
  return getItemSlugs().map((slug) => ({ slug }));
}

// Revalidate periodically so stock numbers refresh from R2.
export const revalidate = 300;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Load per-model stock from R2 (cached). May be empty if R2 is
  // unavailable or no stock entry exists for this product.
  const stockItems = await getAllStockForSlug(slug);
  const stockMap = new Map(stockItems.map((i) => [i.model, i.stock]));
  const hasStockData = stockItems.length > 0;
  const totalStock = stockItems.reduce((sum, i) => sum + i.stock, 0);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="text-sm text-blue-700 hover:text-blue-500 transition-colors"
          >
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
          <span className="text-sm text-gray-600">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block bg-blue-50 text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
                {product.category}
              </span>
              <h1 className="font-mincho text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="w-10 h-px bg-blue-200 mb-5" />
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Stock summary badge */}
              <div className="mt-4">
                {hasStockData ? (
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                      totalStock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        totalStock > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {totalStock > 0
                      ? `在庫あり（合計 ${totalStock} 点）`
                      : "在庫切れ"}
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
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
                  <h2 className="font-mincho text-lg font-semibold text-white tracking-tight">製品仕様</h2>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr
                          key={spec.label}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
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
            )}

            {/* Model Numbers */}
            {product.models && product.models.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
                  <h2 className="font-mincho text-lg font-semibold text-white tracking-tight">型番一覧</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {product.models.map((model) => {
                      const hasDetailPage =
                        getModelByCodeForSlug(model, slug) !== undefined;
                      const stock = stockMap.get(model);
                      const hasStock = hasStockData && stock !== undefined;
                      const inStock = hasStock && (stock as number) > 0;

                      const stockBadge = hasStock ? (
                        <span
                          className={`ml-2 text-xs font-semibold ${
                            inStock ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {inStock ? `在庫 ${stock}` : "在庫切れ"}
                        </span>
                      ) : null;

                      if (hasDetailPage) {
                        return (
                          <Link
                            key={model}
                            href={`/inventory/${slug}/${model}`}
                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <span>
                              {model}
                              <span className="text-blue-600 ml-2 text-xs">
                                → 詳細
                              </span>
                            </span>
                            {stockBadge}
                          </Link>
                        );
                      }
                      return (
                        <div
                          key={model}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700"
                        >
                          <span>{model}</span>
                          {stockBadge}
                        </div>
                      );
                    })}
                  </div>

                  {!hasStockData && (
                    <p className="mt-4 text-sm text-gray-500">
                      在庫数についてはお問い合わせください。
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 text-center border border-blue-100/60">
              <h3 className="section-heading text-xl text-gray-900 mb-4">
                この商品についてのお問い合わせ
              </h3>
              <div className="w-10 h-px bg-blue-200 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                在庫確認や見積もりなど、お気軽にお問い合わせください。
              </p>
              <Link
                href="/inquiry"
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                お問い合わせ
              </Link>
            </div>

            {/* Back Link */}
            <div className="mt-8 text-center">
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