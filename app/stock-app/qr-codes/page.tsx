"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

type ProductInfo = {
  slug: string;
  name: string;
  modelCount: number;
  totalStock: number;
};

export default function QrCodesPage() {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (sessionStorage.getItem("stock-app-auth") !== "ok") {
          window.location.href = "/stock-app/login";
          return;
        }
        const res = await fetch("/api/stock/products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          // Generate QR codes for each slug
          const urls: Record<string, string> = {};
          for (const p of data.products) {
            urls[p.slug] = await QRCode.toDataURL(p.slug, {
              width: 200,
              margin: 1,
              color: { dark: "#000000", light: "#ffffff" },
            });
          }
          setQrDataUrls(urls);
        }
      } catch (err) {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.slug.toLowerCase().includes(filter.toLowerCase()) ||
      p.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/stock-app" className="text-blue-200 hover:text-white">
            ← 戻る
          </a>
          <h1 className="text-lg font-bold">QRコード一覧</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Filter */}
        <input
          type="text"
          placeholder="検索 (スラッグ・商品名)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* QR code grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.slug}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              {qrDataUrls[p.slug] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrls[p.slug]}
                  alt={p.slug}
                  className="w-32 h-32 mb-2"
                />
              )}
              <p className="text-xs font-mono text-gray-600 text-center break-all">
                {p.slug}
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                {p.name}
              </p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            該当する商品がありません
          </p>
        )}
      </main>
    </div>
  );
}