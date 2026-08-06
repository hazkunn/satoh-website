"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function InquiryPage() {
  const initialFilled = useRef(false);

  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Read URL params on mount to auto-fill form from AI chat
  useEffect(() => {
    if (initialFilled.current) return;
    const params = new URLSearchParams(window.location.search);
    const fields = ["company", "name", "email", "phone", "subject", "message"];
    let hasData = false;
    const filled: Record<string, string> = {};

    for (const field of fields) {
      const value = params.get(field);
      if (value) {
        filled[field] = decodeURIComponent(value);
        hasData = true;
      }
    }
    if (hasData) {
      initialFilled.current = true;
      setFormData((prev) => ({ ...prev, ...filled }));
    }
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.email.trim() && !formData.phone.trim()) {
      errs.email = "メールアドレスまたは電話番号のいずれかを入力してください";
      errs.phone = "メールアドレスまたは電話番号のいずれかを入力してください";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const mailtoSubject = encodeURIComponent(
      `【お問い合わせ】${formData.subject}`
    );
    const mailtoBody = encodeURIComponent(
      `会社名: ${formData.company}
氏名: ${formData.name}
メールアドレス: ${formData.email}
電話番号: ${formData.phone}
【お問い合わせ内容】
${formData.message}`
    );

    window.location.href = `mailto:info@sato-sangyo.example.com?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  return (
    <>
      {/* Page Header */}
      <section className="relative bg-blue-950 text-white py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow text-blue-300 mb-4">CONTACT</p>
          <h1 className="font-mincho text-3xl md:text-4xl font-semibold mb-5 tracking-tight">お問い合わせ</h1>
          <div className="accent-rule mb-5" />
          <p className="text-blue-200/90 max-w-2xl leading-relaxed">
            製品・サービスに関するお問い合わせ、お見積もりのご依頼など、
            お気軽にご連絡ください。
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-500 transition-colors">
            ホーム
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <span className="text-sm text-gray-600">お問い合わせ</span>
        </div>
      </div>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="section-heading text-xl text-gray-900 mb-6">
                  連絡先
                </h2>
                <div className="w-8 h-px bg-blue-200 mb-6" />

                {/* Phone */}
                <div className="flex items-start mb-6">
                  <svg
                    className="w-6 h-6 text-blue-700 mr-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">お電話</p>
                    <p className="font-mincho text-xl font-semibold text-blue-900 tracking-tight">
                      0896-23-2031
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      受付時間 平日 9:00 - 17:00
                    </p>
                  </div>
                </div>

                {/* FAX */}
                <div className="flex items-start mb-6">
                  <svg
                    className="w-6 h-6 text-blue-700 mr-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a25 25 0 01-.93 6.02m8.93-6.02H15l5 3v7a2 2 0 01-2 2H9a2 2 0 01-2-2V9zm0 0V5a2 2 0 012-2h6a2 2 0 012 2v4M6 12h6m-6 4h2"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">FAX</p>
                    <p className="font-mincho text-lg font-semibold text-blue-900 tracking-tight">
                      0896-24-1065
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      24時間受付
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-blue-700 mr-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">メール</p>
                    <p className="text-base font-semibold text-blue-900">
                      info@sato-sangyo.example.com
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      下記フォームからも送信いただけます
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-100/60">
                <h3 className="section-heading text-lg text-gray-900 mb-4">
                  お問い合わせの際のご注意
                </h3>
                <div className="w-8 h-px bg-blue-200 mb-4" />
                <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
                  <li>・お問い合わせ内容によっては、回答にお時間をいただく場合がございます。</li>
                  <li>・土日祝日・休業日のお問い合わせは、翌営業日以降の回答となります。</li>
                  <li>・いただいた個人情報は、お問い合わせ対応以外の目的では使用いたしません。</li>
                </ul>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="section-heading text-xl text-gray-900 mb-8">
                  メールでのお問い合わせ
                </h2>
                <div className="w-10 h-px bg-blue-200 mb-8" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      会社名
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="株式会社○○"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      お名前
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="山田 太郎"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      メールアドレス{" "}
                      <span className="text-xs font-normal text-gray-400">
                        (電話番号とどちらか必須)
                      </span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.email
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="info@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      電話番号{" "}
                      <span className="text-xs font-normal text-gray-400">
                        (メールアドレスとどちらか必須)
                      </span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                        errors.phone
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="00-0000-0000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      お問い合わせ項目
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                    >
                      <option value="">選択してください</option>
                      <option value="製品について">製品について</option>
                      <option value="在庫について">在庫について</option>
                      <option value="お見積もりについて">
                        お見積もりについて
                      </option>
                      <option value="サービスについて">
                        サービスについて
                      </option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      お問い合わせ内容
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical"
                      placeholder="お問い合わせ内容をご記入ください"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      メールで送信する
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-3">
                      ※送信ボタンをクリックすると、お使いのメールソフトが起動します。
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}