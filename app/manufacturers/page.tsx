import Link from "next/link";

const manufacturers = [
  {
    category: "油圧・空圧機器",
    companies: [
      "株式会社コガネイ",
      "SMC株式会社",
      "株式会社不二越",
      "カヤバ株式会社",
    ],
  },
  {
    category: "切削工具・工作機械",
    companies: [
      "三菱マテリアル株式会社",
      "株式会社タンガロイ",
      "京セラ株式会社",
      "住友電工ハードメタル株式会社",
    ],
  },
  {
    category: "機構部品・搬送機器",
    companies: [
      "THK株式会社",
      "日本ベアリング株式会社",
      "ミスミ株式会社",
      "椿本チエイン株式会社",
    ],
  },
  {
    category: "測定・検査機器",
    companies: [
      "株式会社ミツトヨ",
      "株式会社東京精密",
      "株式会社小坂研究所",
      "株式会社キーエンス",
    ],
  },
  {
    category: "電気・電子部品",
    companies: [
      "オムロン株式会社",
      "三菱電機株式会社",
      "富士電機株式会社",
      "パナソニック株式会社",
    ],
  },
  {
    category: "工場設備・環境機器",
    companies: [
      "株式会社大気社",
      "株式会社荏原製作所",
      "株式会社日立プラントサービス",
      "ダイキン工業株式会社",
    ],
  },
];

export default function ManufacturersPage() {
  return (
    <>
      {/* Page Header */}
      <section className="relative bg-blue-950 text-white py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow text-blue-300 mb-4">PARTNERS</p>
          <h1 className="font-mincho text-3xl md:text-4xl font-semibold mb-5 tracking-tight">取引メーカー</h1>
          <div className="accent-rule mb-5" />
          <p className="text-blue-200/90 max-w-2xl leading-relaxed">
            サトー産業は、国内外の優れたメーカーと強固なパートナーシップを築き、
            お客様に高品質な製品をお届けしております。
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
          <span className="text-sm text-gray-600">取引メーカー</span>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {manufacturers.map((category) => (
              <div
                key={category.category}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <h2 className="font-mincho text-lg font-semibold text-blue-900 mb-6 pb-4 border-b border-gray-200 tracking-tight">
                  {category.category}
                </h2>
                <ul className="space-y-3">
                  {category.companies.map((company) => (
                    <li
                      key={company}
                      className="text-gray-700 hover:text-blue-700 cursor-default transition-colors"
                    >
                      {company}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 text-center border border-blue-100/60">
            <p className="text-gray-700 mb-4">
              上記は一例です。その他多数のメーカー製品を取り扱っております。
            </p>
            <p className="text-gray-700 mb-6">
              取り扱いメーカーについての詳細は、お気軽にお問い合わせください。
            </p>
            <Link
              href="/company"
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