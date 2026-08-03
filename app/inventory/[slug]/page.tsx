import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getItemSlugs,
  getVBeltModelByCode,
  getVBeltProductSlugs,
} from "@/lib/inventory";

export function generateStaticParams() {
  return getItemSlugs().map((slug) => ({ slug }));
}

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

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="text-sm text-blue-700 hover:text-blue-500"
          >
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
          <span className="text-sm text-gray-600">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="bg-blue-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">製品仕様</h2>
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
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="bg-blue-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">型番一覧</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {product.models.map((model) => {
                                          const hasDetailPage = getVBeltModelByCode(model) !== undefined;
                                          if (hasDetailPage) {
                                            return (
                                              <Link
                                                key={model}
                                                href={`/inventory/${slug}/${model}`}
                                                className="block bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                              >
                                                {model}
                                                <span className="text-blue-600 ml-2 text-xs">→ 詳細</span>
                                              </Link>
                                            );
                                          }
                                          return (
                                            <div
                                              key={model}
                                              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700"
                                            >
                                              {model}
                                            </div>
                                          );
                                        })}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                この商品についてのお問い合わせ
              </h3>
              <p className="text-gray-600 mb-6">
                在庫確認や見積もりなど、お気軽にお問い合わせください。
              </p>
              <Link
                href="/inquiry"
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
              >
                お問い合わせ
              </Link>
            </div>

            {/* Back Link */}
            <div className="mt-8 text-center">
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