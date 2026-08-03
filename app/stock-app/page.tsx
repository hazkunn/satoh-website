"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Product = {
  slug: string;
  name: string;
  stock: number;
  models: string[];
};

type ScanState = "idle" | "scanning" | "found" | "error";

export default function StockAppPage() {
  const router = useRouter();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedSlug, setScannedSlug] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<"add" | "sold">("sold");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerRunning, setScannerRunning] = useState(false);

  const scannerRef = useRef<any>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const res = await fetch("/api/stock/products");
      if (res.status === 401) {
        router.push("/stock-app/login");
      }
    } catch {
      // ignore
    }
  }

  // Start QR scanner
  const startScanner = useCallback(async () => {
    setError("");
    setScanState("scanning");
    setScannerRunning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const elementId = "qr-reader";

      const html5QrCode = new Html5Qrcode(elementId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          // On successful scan
          setScannedSlug(decodedText.trim());
          setScanState("found");
          stopScanner();
          lookupProduct(decodedText.trim());
        },
        () => {
          // Ignore per-frame errors
        }
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      setError("カメラを起動できませんでした。HTTPS環境またはカメラ権限を確認してください。");
      setScanState("error");
      setScannerRunning(false);
    }
  }, []);

  // Stop QR scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setScannerRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
        }).catch(() => {});
      }
    };
  }, []);

  // Lookup product by slug
  async function lookupProduct(slug: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/products?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "商品が見つかりません");
        setProduct(null);
        return;
      }

      setProduct(data.product);
    } catch {
      setError("商品情報の取得に失敗しました");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  // Submit movement
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/stock/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: scannedSlug,
          type: movementType,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "在庫更新に失敗しました");
        return;
      }

      setSuccess(
        `在庫更新完了: ${data.beforeStock} → ${data.afterStock} (${movementType === "add" ? "+" : "-"}${quantity})`
      );

      // Update local product stock
      if (product) {
        setProduct({ ...product, stock: data.afterStock });
      }

      // Reset for next scan after 2 seconds
      setTimeout(() => {
        setSuccess("");
        setScannedSlug("");
        setProduct(null);
        setQuantity(1);
        setScanState("idle");
      }, 2000);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  // Manual slug input
  function handleManualInput(e: React.FormEvent) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem("manualSlug") as HTMLInputElement;
    const slug = input.value.trim();
    if (!slug) return;
    setScannedSlug(slug);
    setScanState("found");
    lookupProduct(slug);
  }

  function handleReset() {
    setScannedSlug("");
    setProduct(null);
    setError("");
    setSuccess("");
    setQuantity(1);
    setScanState("idle");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">在庫管理</h1>
        <button
          onClick={() => router.push("/stock-app/login")}
          className="text-sm text-blue-200 hover:text-white"
        >
          ログアウト
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-4 text-center font-semibold">
            ✓ {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Scan state: idle */}
        {scanState === "idle" && !success && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l4 4m8 0V4m0 0h-4m4 0l-4 4m-8 8v4m0 0h4m-4 0l4-4m8 0v4m0 0h-4m4 0l-4-4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">QRコードをスキャン</h2>
              <p className="text-gray-500 text-sm mb-6">
                商品のQRコードをスキャンして在庫を更新します
              </p>
              <button
                onClick={startScanner}
                className="w-full bg-blue-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors"
              >
                スキャン開始
              </button>
            </div>

            {/* Manual input */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-500 text-sm mb-3">
                または品番を手動入力
              </p>
              <form onSubmit={handleManualInput} className="flex gap-2">
                <input
                  type="text"
                  name="manualSlug"
                  placeholder="品番 (例: SATO-001)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  検索
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Scan state: scanning */}
        {scanState === "scanning" && (
          <div>
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden mb-4" />
            <button
              onClick={() => {
                stopScanner();
                setScanState("idle");
              }}
              className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-500"
            >
              キャンセル
            </button>
          </div>
        )}

        {/* Scan state: found */}
        {scanState === "found" && (
          <div className="space-y-4">
            {/* Product info */}
            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">商品情報を取得中...</p>
              </div>
            )}

            {product && !loading && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">品番</p>
                  <p className="font-mono font-bold text-gray-900">{scannedSlug}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">商品名</p>
                  <p className="text-gray-900 font-semibold">{product.name}</p>
                </div>
                {product.models.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">型番</p>
                    <div className="flex flex-wrap gap-1">
                      {product.models.map((m, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-1">現在の在庫</p>
                  <p className={`text-3xl font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock}
                  </p>
                </div>
              </div>
            )}

            {/* Movement form */}
            {product && !loading && !success && (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    操作
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMovementType("sold")}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        movementType === "sold"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      ▼ 出庫
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovementType("add")}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        movementType === "add"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      ▲ 入庫
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    数量
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-gray-100 rounded-lg text-xl font-bold text-gray-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="flex-1 text-center text-2xl font-bold border border-gray-300 rounded-lg py-3"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 bg-gray-100 rounded-lg text-xl font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-colors disabled:opacity-50 ${
                    movementType === "sold"
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                >
                  {loading ? "送信中..." : `${movementType === "sold" ? "出庫" : "入庫"}実行`}
                </button>
              </form>
            )}

            {/* Reset button */}
            {product && !loading && !success && (
              <button
                onClick={handleReset}
                className="w-full text-gray-500 py-3 hover:text-gray-700"
              >
                別の商品をスキャン
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}