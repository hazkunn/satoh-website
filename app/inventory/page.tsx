"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { getAllCategories } from "@/lib/inventory";

const inventoryData = getAllCategories();

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubCategories, setOpenSubCategories] = useState<Set<string>>(new Set());
  const [openProductTypes, setOpenProductTypes] = useState<Set<string>>(new Set());
  const [openBrands, setOpenBrands] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) {
      return { categories: inventoryData, totalResults: 0, searching: false };
    }

    const q = searchQuery.trim().toLowerCase();

    const matched = inventoryData
      .map((cat) => {
        const catMatch =
          cat.category.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q);

        const matchedSubs = cat.subCategories
          .map((sub) => {
            const subMatch =
              sub.subCategory.toLowerCase().includes(q) ||
              sub.description.toLowerCase().includes(q);

            const matchedPTs = sub.productTypes
              .map((pt) => {
                const ptMatch =
                  pt.productType.toLowerCase().includes(q) ||
                  pt.description.toLowerCase().includes(q);

                const matchedBrands = pt.brands
                  .map((br) => {
                    const brandMatch =
                      br.brand.toLowerCase().includes(q) ||
                      br.description.toLowerCase().includes(q);
                    const matchedSeries = br.series.filter(
                      (item) =>
                        item.name.toLowerCase().includes(q) ||
                        item.series.toLowerCase().includes(q)
                    );
                    return { br, brandMatch, matchedSeries };
                  })
                  .filter((x) => x.brandMatch || x.matchedSeries.length > 0)
                  .map(({ br, matchedSeries }) => ({ ...br, series: matchedSeries }));

                return { pt, ptMatch, matchedBrands };
              })
              .filter((x) => x.ptMatch || x.matchedBrands.length > 0)
              .map(({ pt, matchedBrands }) => ({ ...pt, brands: matchedBrands }));

            return { sub, subMatch, matchedPTs };
          })
          .filter((x) => x.subMatch || x.matchedPTs.length > 0)
          .map(({ sub, matchedPTs }) => ({ ...sub, productTypes: matchedPTs }));

        return { cat, catMatch, matchedSubs };
      })
      .filter((x) => x.catMatch || x.matchedSubs.length > 0)
      .map(({ cat, matchedSubs }) => ({ ...cat, subCategories: matchedSubs }));

    const totalResults = matched.reduce(
      (sum, c) =>
        sum +
        c.subCategories.reduce(
          (ss, sub) =>
            ss +
            sub.productTypes.reduce(
              (ps, pt) =>
                ps + pt.brands.reduce((bs, br) => bs + br.series.length, 0),
              0
            ),
          0
        ),
      0
    );

    return { categories: matched, totalResults, searching: true };
  }, [searchQuery]);

  // When searching, auto-expand all nodes
  const isSearching = filtered.searching;

  return (
    <>
      <section className="relative bg-blue-950 text-white py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow text-blue-300 mb-4">INVENTORY</p>
          <h1 className="font-mincho text-3xl md:text-4xl font-semibold mb-5 tracking-tight">商品在庫案内</h1>
          <div className="accent-rule mb-5" />
          <p className="text-blue-200/90 max-w-2xl leading-relaxed">
            サトー産業は、常時豊富な在庫を確保し、お客様の急なご要望にも迅速に対応いたします。
            キーワードで在庫商品を検索できます。
          </p>
        </div>
      </section>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-500 transition-colors">
            ホーム
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <span className="text-sm text-gray-600">商品在庫案内</span>
        </div>
      </div>

      <section className="py-16 md:py-20">
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
                  placeholder="商品名・カテゴリ・メーカーで検索（例: 三ツ星、Vベルト、A形）"
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
          {isSearching && (
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

          {/* Inventory — Collapsible Category → Sub → ProductType → Brand → Series */}
          <div className="space-y-3">
            {filtered.categories.map((cat) => {
              const catKey = cat.category;
              const catOpen = isSearching || openCategories.has(catKey);
              const hasContent = cat.subCategories.length > 0;

              return (
                <div
                  key={catKey}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                >
                  {/* Category Header (clickable) */}
                  <button
                    onClick={() =>
                      hasContent &&
                      toggle(openCategories, catKey, setOpenCategories)
                    }
                    className={`w-full flex items-center justify-between px-6 py-4 ${
                      hasContent ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                    } transition-colors`}
                  >
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-blue-900">
                        {cat.category}
                      </h2>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                    {hasContent && (
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          catOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* SubCategories */}
                  {catOpen && hasContent && (
                    <div className="border-t border-gray-200">
                      {cat.subCategories.map((sub) => {
                        const subKey = `${catKey} > ${sub.subCategory}`;
                        const subOpen = isSearching || openSubCategories.has(subKey);
                        const hasPTs = sub.productTypes.length > 0;

                        return (
                          <div key={subKey} className="border-b border-gray-100 last:border-b-0">
                            <button
                              onClick={() =>
                                hasPTs &&
                                toggle(openSubCategories, subKey, setOpenSubCategories)
                              }
                              className={`w-full flex items-center justify-between px-6 py-3 pl-10 ${
                                hasPTs ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                              } transition-colors`}
                            >
                              <div className="text-left">
                                <h3 className="text-base font-semibold text-gray-800">
                                  {sub.subCategory}
                                </h3>
                                <p className="text-gray-400 text-xs mt-0.5">
                                  {sub.description}
                                </p>
                              </div>
                              {hasPTs && (
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    subOpen ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )}
                            </button>

                            {/* ProductTypes */}
                            {subOpen && hasPTs && (
                              <div>
                                {sub.productTypes.map((pt) => {
                                  const ptKey = `${subKey} > ${pt.productType}`;
                                  const ptOpen = isSearching || openProductTypes.has(ptKey);
                                  const hasBrands = pt.brands.length > 0;

                                  return (
                                    <div key={ptKey} className="border-t border-gray-50">
                                      <button
                                        onClick={() =>
                                          hasBrands &&
                                          toggle(openProductTypes, ptKey, setOpenProductTypes)
                                        }
                                        className={`w-full flex items-center justify-between px-6 py-2.5 pl-16 ${
                                          hasBrands ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                                        } transition-colors`}
                                      >
                                        <div className="text-left">
                                          <span className="text-sm font-medium text-gray-700">
                                            {pt.productType}
                                          </span>
                                          <span className="text-gray-400 text-xs ml-3">
                                            {pt.description}
                                          </span>
                                        </div>
                                        {hasBrands && (
                                          <svg
                                            className={`w-4 h-4 text-gray-400 transition-transform ${
                                              ptOpen ? "rotate-180" : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        )}
                                      </button>

                                      {/* Brands */}
                                      {ptOpen && hasBrands && (
                                        <div>
                                          {pt.brands.map((br) => {
                                            const brKey = `${ptKey} > ${br.brand}`;
                                            const brOpen = isSearching || openBrands.has(brKey);
                                            const hasSeries = br.series.length > 0;

                                            return (
                                              <div key={brKey} className="border-t border-gray-50">
                                                <button
                                                  onClick={() =>
                                                    hasSeries &&
                                                    toggle(openBrands, brKey, setOpenBrands)
                                                  }
                                                  className={`w-full flex items-center justify-between px-6 py-2 pl-24 ${
                                                    hasSeries ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                                                  } transition-colors`}
                                                >
                                                  <div className="text-left">
                                                    <span className="text-sm font-medium text-gray-600">
                                                      {br.brand}
                                                    </span>
                                                    <span className="text-gray-400 text-xs ml-3">
                                                      {br.description}
                                                    </span>
                                                  </div>
                                                  {hasSeries && (
                                                    <svg
                                                      className={`w-4 h-4 text-gray-400 transition-transform ${
                                                        brOpen ? "rotate-180" : ""
                                                      }`}
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      stroke="currentColor"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                      />
                                                    </svg>
                                                  )}
                                                </button>

                                                {/* Series (leaf items) */}
                                                {brOpen && hasSeries && (
                                                  <div className="px-6 pl-32 py-2">
                                                    <ul className="space-y-1.5">
                                                      {br.series.map((item) => {
                                                        const isHighlighted =
                                                          isSearching &&
                                                          (item.name
                                                            .toLowerCase()
                                                            .includes(searchQuery.trim().toLowerCase()) ||
                                                            item.series
                                                              .toLowerCase()
                                                              .includes(searchQuery.trim().toLowerCase()));
                                                        return (
                                                          <li key={item.slug}>
                                                            <Link
                                                              href={`/inventory/${item.slug}`}
                                                              className={`text-sm flex items-start group ${
                                                                isHighlighted
                                                                  ? "bg-yellow-50 -mx-2 px-2 py-1 rounded-lg"
                                                                  : "py-1"
                                                              }`}
                                                            >
                                                              <span className="text-blue-500 mr-2 group-hover:text-blue-700">
                                                                ・
                                                              </span>
                                                              <span className="group-hover:text-blue-700 group-hover:font-medium transition-colors">
                                                                {item.name}
                                                                <span className="text-gray-400 text-xs ml-2">
                                                                  ({item.series})
                                                                </span>
                                                              </span>
                                                            </Link>
                                                          </li>
                                                        );
                                                      })}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {isSearching && filtered.totalResults === 0 && (
            <div className="mt-8 bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
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
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                お問い合わせ
              </Link>
            </div>
          )}

          {/* Note */}
          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
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
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 text-center border border-blue-100/60">
            <h3 className="section-heading text-xl text-gray-900 mb-4">
              在庫・納期のお問い合わせ
            </h3>
            <div className="w-10 h-px bg-blue-200 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              商品の在庫確認や納期については、お電話またはお問い合わせフォームよりご連絡ください。
            </p>
            <Link
              href="/inquiry"
              className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}