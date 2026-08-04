"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PASSWORD = process.env.NEXT_PUBLIC_STOCK_APP_PASSWORD || "satoh-stock-2024";

export default function StockAppLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem("stock-app-auth", "ok");
      router.push("/stock-app");
    } else {
      setError("パスワードが正しくありません");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">在庫管理アプリ</h1>
            <p className="text-gray-500 mt-2 text-sm">
              佐藤商事 在庫管理システム
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              ログイン
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © 佐藤商事 株式会社
        </p>
      </div>
    </div>
  );
}