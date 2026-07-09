"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { getAllCategories } from "@/lib/inventory";

const inventoryData = getAllCategories();

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) {
      return { categories: inventoryData, totalResults: 0, searching: false };
    }

    const q = searchQuery.trim().toLowerCase();

    const matched = inventoryData
      .map((cat) => {
        const matchedItems = cat.items.filter((item) =>
          item.name.toLowerCase().includes(q)
        );
        const catMatch =
          cat.category.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q);
        return {
          ...cat,
          items: matchedItems,
          catMatch,
        };
      })
      .filter((cat) => cat.catMatch || cat.items.length > 0)
      .map(({ catMatch, ...rest }) => rest);

    const totalResults = matched.reduce((sum, c) => sum + c.items.length, 0);

    return { categories: matched, totalResults, searching: true };
  }, [searchQuery]);

  return (
    <>
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">商品在庫案内</h1>
          <p className="text-blue-200 max-w-2xl">
            サトー産業は、常時豊富な在庫を確保し、お客様の急なご要望にも迅速に対応いたします。
            キーワードで在庫商品を検索できます。
          </p>
        </div>
      </section>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-500">
            ホーム
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <span className="text-sm text-gray-600">商品在庫案内</span>
        </div>
      </div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <label htmlFor="search" className="sr-only">
                在庫を検索
              </label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="商品名・カテゴリを検索（例: ポンプ、センサー、ベアリング）"
                  className="w-full pl-12 pr-10 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="検索をクリア"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results Info */}
          {filtered.searching && (
            <div className="text-center mb-8">
              <p className="text-gray-600">
                「
                <span className="font-semibold text-blue-900">
                  {searchQuery.trim()}
                </span>
                」の検索結果：
                <span className="font-bold text-blue-900">
                  {filtered.totalResults}
                </span>{" "}
                件
                {filtered.totalResults === 0 &&
                  " — 該当する商品が見つかりませんでした。"}
              </p>
            </div>
          )}

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.categories.map((category) => (
              <div
                key={category.category}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="bg-blue-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">
                    {category.category}
                  </h2>
                  <p className="text-blue-200 text-sm mt-1">
                    {category.description}
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {category.items.map((item) => {
                      const isHighlighted =
                        filtered.searching &&
                        item.name
                          .toLowerCase()
                          .includes(searchQuery.trim().toLowerCase());
                      return (
                        <li key={item.slug}>
                          <Link
                            href={`/inventory/${item.slug}`}
                            className={`text-gray-700 text-sm flex items-start group ${
                              isHighlighted
                                ? "bg-yellow-50 -mx-3 px-3 py-1 rounded-lg"
                                : "py-1"
                            }`}
                          >
                            <span className="text-blue-500 mr-2 group-hover:text-blue-700">
                              ・
                            </span>
                            <span className="group-hover:text-blue-700 group-hover:font-medium transition-colors">
                              {item.name}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filtered.searching && filtered.totalResults === 0 && (
            <div className="mt-8 bg-gray-50 rounded-xl p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 mb-4">
                お探しの商品が見つかりませんでした。お気軽にお問い合わせください。
              </p>
              <Link
                href="/inquiry"
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          )}

          {/* Note */}
          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-8">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ご注意ください
                </h3>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  上記は在庫品の一部です。全ての在庫品を掲載しているわけではございません。
                  最新の在庫状況や掲載以外の商品については、お気軽にお問い合わせください。
                  また、在庫状況は変動するため、ご注文の際は在庫確認をお願いいたします。
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              在庫・納期のお問い合わせ
            </h3>
            <p className="text-gray-600 mb-6">
              商品の在庫確認や納期については、お電話またはお問い合わせフォームよりご連絡ください。
            </p>
            <Link
              href="/inquiry"
              className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}