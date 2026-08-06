import Link from "next/link";

export default function ExhibitionPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.18),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="eyebrow text-blue-300 mb-5">
              展示会・技術商談会
            </p>
            <h1 className="font-mincho text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-[1.2] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              テクノメッセ
              <br />
              <span className="text-blue-200/90 tracking-[0.15em] text-3xl md:text-4xl lg:text-5xl">TECHNOMESSE</span>
            </h1>
            <div className="accent-rule mb-6" />
            <p className="text-lg md:text-xl text-blue-100/90 mb-10 leading-relaxed">
              最新の産業技術・製品が一堂に集う展示会。
              実際に製品に触れ、専門スタッフが直接ご説明いたします。
            </p>
            <Link
              href="/inquiry"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="eyebrow text-blue-700 mb-4">ABOUT</p>
            <h2 className="section-heading text-3xl md:text-4xl text-gray-900 mb-4">
              テクノメッセについて
            </h2>
            <div className="accent-rule mx-auto mb-6" />
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h3 className="section-heading text-xl text-gray-900 mb-4">開催概要</h3>
              <div className="w-8 h-px bg-blue-200 mb-4" />
              <p className="text-gray-600 leading-relaxed">
                テクノメッセは、愛媛県内の産業技術・製品を広く紹介する展示会です。
                サトー産業も毎年出展し、最新の製品情報やソリューションをご提案しています。
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h3 className="section-heading text-xl text-gray-900 mb-4">出展内容</h3>
              <div className="w-8 h-px bg-blue-200 mb-4" />
              <p className="text-gray-600 leading-relaxed">
                制御機器・センサー・電動工具・安全保護具など、幅広い産業資材を展示。
                実際に手に取ってご確認いただけます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}