import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">サトー産業</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              信頼と実績の商社として、お客様のビジネスを
              トータルにサポートいたします。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">メニュー</h3>
            <ul className="space-y-2">
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
                    className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">お問い合わせ</h3>
            <div className="text-blue-200 text-sm space-y-2">
              <p>営業時間: 平日 9:00 - 17:00</p>
              <p>定休日: 土・日・祝日</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300 text-sm">
          <p>&copy; {new Date().getFullYear()} サトー産業. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}