import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-baseline space-x-2.5 mb-5">
              <h3 className="font-mincho text-xl font-semibold tracking-tight">サトー産業</h3>
              <span className="text-[10px] font-medium text-blue-300/70 tracking-[0.3em] uppercase">
                SATO&nbsp;SANGYO
              </span>
            </div>
            <div className="accent-rule mb-5" />
            <p className="text-blue-200/80 text-sm leading-relaxed">
              信頼と実績の商社として、お客様のビジネスを
              トータルにサポートいたします。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-mincho text-lg font-semibold mb-5 tracking-tight">メニュー</h3>
            <div className="w-8 h-px bg-blue-700/60 mb-5" />
            <ul className="space-y-3">
              {[
                { href: "/", label: "ホーム" },
                { href: "/manufacturers", label: "取引メーカー" },
                { href: "/services", label: "サービス紹介" },
                { href: "/inventory", label: "商品在庫案内" },
                { href: "/company", label: "会社概要" },
                { href: "/inquiry", label: "お問い合わせ" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-blue-200/80 hover:text-white text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mincho text-lg font-semibold mb-5 tracking-tight">お問い合わせ</h3>
            <div className="w-8 h-px bg-blue-700/60 mb-5" />
            <div className="text-blue-200/80 text-sm space-y-3">
              <p>営業時間: 平日 9:00 - 17:00</p>
              <p>定休日: 土・日・祝日</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-900/80 mt-12 pt-8 text-center text-blue-300/70 text-xs tracking-wide">
          <p>&copy; {new Date().getFullYear()} サトー産業. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}