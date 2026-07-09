import Link from "next/link";

export default function CompanyPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">会社概要</h1>
          <p className="text-blue-200 max-w-2xl">
            サトー産業についてのご紹介です。
            お客様に信頼されるパートナーとして、常に進化し続けます。
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
          <span className="text-sm text-gray-600">会社概要</span>
        </div>
      </div>

      {/* Company Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">会社概要</h2>
            </div>
            <div className="p-8">
              <table className="w-full">
                <tbody>
                  {[
                    { label: "商号", value: "サトー産業" },
                    { label: "英語表記", value: "SATO SANGYO CO., LTD." },
                    {
                      label: "所在地",
                      value: "〒000-0000\n東京都千代田区○○町0-0-0\n○○ビル○F",
                    },
                    { label: "代表者", value: "代表取締役 佐藤 ○○" },
                    {
                      label: "設立",
                      value: "19○○年○月○日",
                    },
                    {
                      label: "資本金",
                      value: "○○○○万円",
                    },
                    {
                      label: "事業内容",
                      value:
                        "産業資材・設備機器の販売\n各種プラント設備の設計・施工\n機械装置のメンテナンス・修理\n物流・保管業務",
                    },
                  ].map((item) => (
                    <tr
                      key={item.label}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <th className="py-4 pr-8 text-left text-gray-900 font-semibold w-40 align-top whitespace-nowrap">
                        {item.label}
                      </th>
                      <td className="py-4 text-gray-700 whitespace-pre-line">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vision / Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                経営理念
              </h2>
              <p className="text-gray-600 leading-relaxed">
                私たちサトー産業は、産業の発展とお客様の繁栄に貢献することを使命とし、
                誠実な事業活動を通じて、社会に必要とされる企業を目指します。
                常に清く正しく美しい心で、お客様・取引先・社員と共に成長し続けます。
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                企業ビジョン
              </h2>
              <p className="text-gray-600 leading-relaxed">
                お客様の信頼されるパートナーとして、高品質な製品とサービスの提供を通じて、
                お客様の経営課題を解決します。
                変化を恐れず常に挑戦し続け、業界をリードする企業を目指します。
              </p>
            </div>
          </div>

          {/* Access Map */}
          <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">アクセス</h2>
            </div>
            <div className="p-8">
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="mb-2">
                  〒000-0000 東京都千代田区○○町0-0-0 ○○ビル○F
                </p>
                <p className="text-sm">
                  ○○線「○○駅」より徒歩○分
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              お問い合わせ
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              製品に関するご質問、お見積もりのご依頼など、
              お気軽にお問い合わせください。
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white rounded-lg px-8 py-4 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">お電話でのお問い合わせ</p>
                <p className="text-2xl font-bold text-blue-900">00-0000-0000</p>
                <p className="text-xs text-gray-400 mt-1">
                  受付時間 平日 9:00 - 17:00
                </p>
              </div>
            </div>
            <Link
              href="/inquiry"
              className="inline-block bg-blue-900 text-white px-10 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
            >
              お問い合わせフォームへ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}