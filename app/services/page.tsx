import Link from "next/link";

const services = [
  {
    title: "製品販売",
    description:
      "産業資材・設備機器の販売を中心に、お客様のニーズに合わせた最適な製品をご提案いたします。取引メーカーとの強固なネットワークを活かし、高品質な製品を競争力のある価格でご提供します。",
    features: [
      "油圧・空圧機器の販売",
      "切削工具・工作機械の販売",
      "機構部品・搬送機器の販売",
      "測定・検査機器の販売",
      "電気・電子部品の販売",
      "工場設備・環境機器の販売",
    ],
  },
  {
    title: "技術サポート",
    description:
      "経験豊富な技術スタッフが、製品選定から導入後のフォローアップまでトータルにサポートいたします。お客様の課題解決に向けて、最適な技術ソリューションをご提案します。",
    features: [
      "製品選定・技術相談",
      "導入計画の策定支援",
      "試運転・立ち上げサポート",
      "トラブルシューティング",
      "定期的なメンテナンス",
      "技術トレーニング",
    ],
  },
  {
    title: "物流サービス",
    description:
      "効率的な物流体制で、お客様が必要な時に必要な製品をお届けします。在庫管理から配送まで、一貫した物流サービスを提供し、お客様の在庫リスクの軽減と業務効率化に貢献します。",
    features: [
      "ジャストインタイム配送",
      "在庫一括管理サービス",
      "緊急時即日配送対応",
      "物流センター運用",
      "在庫情報のオンライン提供",
      "返品・交換サポート",
    ],
  },
  {
    title: "設備導入・施工",
    description:
      "工場設備や生産ラインの導入・施工をトータルでサポートします。設計から施工、試運転まで一貫した体制で、お客様の生産性向上とコスト削減を実現します。",
    features: [
      "工場レイアウト設計",
      "生産ライン構築",
      "設備据付・配管工事",
      "電気工事・制御盤設置",
      "試運転調整",
      "既存設備の改修・更新",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">サービス紹介</h1>
          <p className="text-blue-200 max-w-2xl">
            サトー産業は、製品販売から技術サポート、物流、設備導入まで、
            お客様のビジネスをトータルにサポートするサービスを提供しております。
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-500">
            ホーム
          </Link>
          <span className="text-sm text-gray-400 mx-2">{">"}</span>
          <span className="text-sm text-gray-600">サービス紹介</span>
        </div>
      </div>

      {/* Services Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 items-start`}
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-gray-700"
                      >
                        <svg
                          className="w-5 h-5 text-blue-700 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-blue-50 rounded-xl p-8 md:p-12 w-full">
                  <div className="text-blue-900">
                    <svg
                      className="w-16 h-16 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg font-semibold mb-2">
                      まずはお気軽にご相談ください
                    </p>
                    <p className="text-blue-700 text-sm">
                      経験豊富なスタッフがお客様のニーズを伺い、最適なサービスをご提案いたします。
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-blue-900 rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              サービスの詳細について
            </h2>
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              各サービスの詳細やお見積もりについては、お気軽にお問い合わせください。
              専門スタッフが丁寧にご対応いたします。
            </p>
            <Link
              href="/company"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}