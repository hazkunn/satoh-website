"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "ホーム" },
    { href: "/services", label: "サービス紹介" },
    { href: "/exhibition", label: "展示会" },
    { href: "/company", label: "会社概要" },
    { href: "/inventory", label: "商品在庫案内" },
    { href: "/manufacturers", label: "取引メーカー" },
    { href: "/inquiry", label: "お問い合わせ" },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-baseline space-x-2.5 group">
            <span className="font-mincho text-2xl font-semibold text-blue-900 tracking-tight transition-colors group-hover:text-blue-700">
              サトー産業
            </span>
            <span className="text-[10px] font-medium text-slate-400 hidden sm:inline tracking-[0.3em] uppercase">
              SATO&nbsp;SANGYO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm text-slate-600 hover:text-blue-900 font-medium tracking-wide transition-colors duration-200 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニューを開く"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-5 border-t border-slate-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-3.5 text-slate-700 hover:text-blue-900 hover:bg-blue-50/60 font-medium rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}