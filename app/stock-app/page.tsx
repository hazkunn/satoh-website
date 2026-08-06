"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────

type ModelEntry = { code: string; stock: number };

type ProductDetail = {
  slug: string;
  name: string;
  models: ModelEntry[];
};

type Step = "menu" | "scanning" | "product" | "confirm" | "done";
type Mode = "add" | "sold";

// Minimal structural type for the html5-qrcode scanner instance
// (the package ships no .d.ts; we only use start/stop/clear).
type Html5QrcodeInstance = {
  start: (
    cameraIdOrConfig: string | { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number } },
    onSuccess: (decodedText: string) => void,
    onError: (error: unknown) => void
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
};

// ── Component ──────────────────────────────────────────────

export default function StockAppPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("menu");
  const [mode, setMode] = useState<Mode>("sold");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const html5QrCodeRef = useRef<Html5QrcodeInstance | null>(null);

  // ── Auth check on mount ──────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("stock-app-auth") !== "ok") {
      router.push("/stock-app/login");
    }
  }, [router]);

  // ── Stop scanner helper ─────────────────────────────────
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
    setScanning(false);
  }, []);

  // ── Lookup product by slug ──────────────────────────────
  const lookupProduct = useCallback(
    async (slug: string) => {
      setError("");
      setLoading(true);
      setStep("product");
      try {
        const res = await fetch(
          `/api/stock/products?slug=${encodeURIComponent(slug)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "商品が見つかりません");
          setProduct(null);
          setStep("menu");
          return;
        }
        const p: ProductDetail = data.product;
        setProduct(p);
        // Auto-select first model
        if (p.models.length > 0) {
          setSelectedModel(p.models[0].code);
        }
      } catch {
        setError("商品情報の取得に失敗しました");
        setProduct(null);
        setStep("menu");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Start QR scanner ────────────────────────────────────
  const startScanner = useCallback(async () => {
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(
        "qr-reader"
      ) as unknown as Html5QrcodeInstance;
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          const slug = decodedText.trim();
          stopScanner();
          lookupProduct(slug);
        },
        () => {
          // per-frame error — ignore
        }
      );
      // Only mark as scanning once the camera is actually live.
      setScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setError(
        "カメラを起動できませんでした。HTTPS環境またはカメラ権限を確認してください。"
      );
      setScanning(false);
    }
  }, [stopScanner, lookupProduct]);

  // ── Auto-start scanner when entering scanning step ──────
  useEffect(() => {
    if (step !== "scanning") return;
    let cancelled = false;
    // startScanner() and the defensive stopScanner() below both call setState,
    // but only in async continuations (after an await) — not synchronously in
    // the effect body — so they don't cause cascading renders. The rule can't
    // tell the difference, hence the scoped disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startScanner().then(() => {
      if (cancelled) {
        // Component left the scanning step before we finished starting.
        stopScanner();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [step, startScanner, stopScanner]);

  // ── Cleanup scanner on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  // ── Manual slug entry ───────────────────────────────────
  function handleManualInput(e: React.FormEvent) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem(
      "manualSlug"
    ) as HTMLInputElement;
    const slug = input.value.trim();
    if (!slug) return;
    lookupProduct(slug);
  }

  // ── Proceed to confirm ───────────────────────────────────
  function handleProceedToConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !selectedModel || quantity < 1) return;
    setStep("confirm");
  }

  // ── Submit movement ─────────────────────────────────────
  async function handleConfirm() {
    if (!product || !selectedModel) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stock/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          model: selectedModel,
          type: mode,
          quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "在庫更新に失敗しました");
        return;
      }

      setInfo(
        `完了: ${product.name} ${selectedModel} — ${data.beforeStock} → ${data.afterStock} (${
          mode === "add" ? "+" : "-"
        }${quantity})`
      );
      setStep("done");
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  // ── Reset to menu ───────────────────────────────────────
  function resetToMenu() {
    setProduct(null);
    setSelectedModel("");
    setQuantity(1);
    setError("");
    setInfo("");
    setStep("menu");
  }

  // ── Get current model stock ─────────────────────────────
  const currentModelStock =
    product?.models.find((m) => m.code === selectedModel)?.stock ?? 0;

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════

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
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Info / success */}
        {info && step === "done" && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-4 text-center font-semibold">
            ✓ {info}
          </div>
        )}

        {/* ── Step: menu (choose add or sold) ─────────────── */}
        {step === "menu" && (
          <div className="space-y-6">
            <div className="text-center pt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                操作を選択
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                入庫または出庫を選んでからQRコードをスキャンします
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setMode("sold");
                  setStep("scanning");
                }}
                className="bg-red-600 text-white py-8 rounded-xl font-bold text-lg hover:bg-red-500 transition-colors flex flex-col items-center gap-2"
              >
                <span className="text-3xl">▼</span>
                <span>出庫</span>
                <span className="text-xs font-normal opacity-80">売上・出庫</span>
              </button>
              <button
                onClick={() => {
                  setMode("add");
                  setStep("scanning");
                }}
                className="bg-green-600 text-white py-8 rounded-xl font-bold text-lg hover:bg-green-500 transition-colors flex flex-col items-center gap-2"
              >
                <span className="text-3xl">▲</span>
                <span>入庫</span>
                <span className="text-xs font-normal opacity-80">仕入・入庫</span>
              </button>
            </div>

            {/* Manual input fallback */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-500 text-sm mb-3">
                または品番を手動入力
              </p>
              <form onSubmit={handleManualInput} className="flex gap-2">
                <input
                  type="text"
                  name="manualSlug"
                  placeholder="スラッグ (例: mitsuboshi-v-belt-a)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  検索
                </button>
              </form>
            </div>

            {/* Link to QR code page */}
            <div className="border-t border-gray-200 pt-4 text-center">
              <a
                href="/stock-app/qr-codes"
                className="text-blue-600 text-sm hover:underline"
              >
                QRコード一覧を表示 →
              </a>
            </div>
          </div>
        )}

        {/* ── Step: scanning ─────────────────────────────── */}
        {step === "scanning" && (
          <div className="space-y-4">
            <div className="text-center">
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                  mode === "sold"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {mode === "sold" ? "▼ 出庫モード" : "▲ 入庫モード"}
              </span>
            </div>

            <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />

            {scanning && (
              <p className="text-center text-gray-500 text-sm">
                QRコードにカメラを向けてください...
              </p>
            )}

            {/* Manual input while scanning */}
            <div className="border-t border-gray-200 pt-4">
              <form onSubmit={handleManualInput} className="flex gap-2">
                <input
                  type="text"
                  name="manualSlug"
                  placeholder="手動入力 (スラッグ)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  検索
                </button>
              </form>
            </div>

            <button
              onClick={async () => {
                await stopScanner();
                setStep("menu");
              }}
              className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-500"
            >
              戻る
            </button>
          </div>
        )}

        {/* ── Step: product (select model + quantity) ────── */}
        {step === "product" && (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">商品情報を取得中...</p>
              </div>
            )}

            {product && !loading && (
              <>
                {/* Mode badge */}
                <div className="text-center">
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                      mode === "sold"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {mode === "sold" ? "▼ 出庫" : "▲ 入庫"}
                  </span>
                </div>

                {/* Product card */}
                <div className="bg-white rounded-xl shadow p-6">
                  <p className="text-xs text-gray-400 mb-1">商品</p>
                  <p className="text-gray-900 font-bold text-lg mb-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mb-4">
                    {product.slug}
                  </p>

                  {/* Model selector */}
                  {product.models.length > 0 ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        型番を選択
                      </label>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        {product.models.map((m) => (
                          <button
                            key={m.code}
                            type="button"
                            onClick={() => setSelectedModel(m.code)}
                            className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                              selectedModel === m.code
                                ? "bg-blue-50 text-blue-900 font-bold"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span className="font-mono">{m.code}</span>
                            <span
                              className={`text-sm ${
                                m.stock > 0 ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              在庫: {m.stock}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">
                      モデル情報がありません
                    </p>
                  )}

                  {/* Current stock for selected model */}
                  {selectedModel && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                      <p className="text-xs text-gray-400">選択中の在庫</p>
                      <p
                        className={`text-2xl font-bold ${
                          currentModelStock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {currentModelStock}
                      </p>
                    </div>
                  )}

                  {/* Quantity input */}
                  <form onSubmit={handleProceedToConfirm}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      数量
                    </label>
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 bg-gray-100 rounded-lg text-xl font-bold text-gray-700 shrink-0"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        min={1}
                        className="flex-1 text-center text-2xl font-bold border border-gray-300 rounded-lg py-3 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 bg-gray-100 rounded-lg text-xl font-bold text-gray-700 shrink-0"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedModel || quantity < 1}
                      className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-colors disabled:opacity-50 ${
                        mode === "sold"
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-green-600 hover:bg-green-500"
                      }`}
                    >
                      確認へ進む
                    </button>
                  </form>
                </div>

                <button
                  onClick={resetToMenu}
                  className="w-full text-gray-500 py-3 hover:text-gray-700"
                >
                  戻る
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Step: confirm ──────────────────────────────── */}
        {step === "confirm" && product && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  確認
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">操作</span>
                    <span
                      className={`font-semibold ${
                        mode === "sold" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {mode === "sold" ? "▼ 出庫" : "▲ 入庫"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">商品</span>
                    <span className="text-gray-900 font-semibold">
                      {product.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">型番</span>
                    <span className="text-gray-900 font-mono font-bold">
                      {selectedModel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">現在在庫</span>
                    <span className="text-gray-900 font-semibold">
                      {currentModelStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">数量</span>
                    <span className="text-gray-900 font-bold text-xl">
                      {mode === "sold" ? "−" : "+"}
                      {quantity}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-gray-500 text-sm">更新後在庫</span>
                    <span
                      className={`font-bold text-xl ${
                        mode === "sold"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {mode === "sold"
                        ? Math.max(0, currentModelStock - quantity)
                        : currentModelStock + quantity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("product")}
                    className="bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300"
                  >
                    戻る
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`py-4 rounded-xl font-bold text-white disabled:opacity-50 ${
                      mode === "sold"
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                  >
                    {loading ? "送信中..." : "確定 (Enter)"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Step: done ─────────────────────────────────── */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                在庫更新完了
              </h2>
              {info && (
                <p className="text-gray-600 text-sm mb-6">{info}</p>
              )}
            </div>

            <button
              onClick={resetToMenu}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white ${
                mode === "sold"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              次の操作へ
            </button>
          </div>
        )}
      </main>
    </div>
  );
}