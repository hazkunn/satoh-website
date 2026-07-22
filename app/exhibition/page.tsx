import Link from "next/link";

export default function ExhibitionPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-blue-300 font-semibold tracking-wide text-sm md:text-base mb-4">
              展示会・技術商談会
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              テクノメッセ
              <br />
              <span className="text-blue-200">TECHNOMESSE</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-10 leading-relaxed">
              最新の産業技術・製品が一堂に集う展示会。
              実際に製品に触れ、専門スタッフが直接ご説明いたします。
            </p>
            <Link
              href="/inquiry"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            テクノメッセについて
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">開催概要</h3>
              <p className="text-gray-600 leading-relaxed">
                テクノメッセは、愛媛県内の産業技術・製品を広く紹介する展示会です。
                サトー産業も毎年出展し、最新の製品情報やソリューションをご提案しています。
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">出展内容</h3>
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