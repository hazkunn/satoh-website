import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-blue-300 font-semibold tracking-wide text-sm md:text-base mb-4">
              産業資材・設備機器のトータルサプライヤー
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              必要な製品を、
              <br />
              <span className="text-blue-200">最適な形でご提供します。</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-10 leading-relaxed">
              型番不明・廃番品・初めてのお取引——どんな条件でも構いません。
              お客様からいただいた情報をもとに、最適な製品のマッチング、
              代替品のご提案、在庫確認までワンストップで対応いたします。
              <br />
              <span className="text-blue-300 text-base">愛媛県内のお客様を迅速にサポートいたします。</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/inquiry"
                className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                アイテムを依頼する
              </Link>
              <Link
                href="/inventory"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200"
              >
                在庫商品を確認する
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            たったの4ステップ
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16">
              お客様に必要なのは「アイテムの情報をお伝えいただく」ことだけ。
              専門スタッフが最適な製品を調査・提案いたします。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-blue-200" />

            {[
              {
                step: "01",
                title: "アイテムを\nお知らせください",
                description:
                  "製品名、型番、写真など、わかる範囲で情報をお送りください。少しの情報でも構いません。",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "専門スタッフが\n調査・分析",
                description:
                  "豊富な取引ネットワークと専門知識であなたのアイテムに最適な製品を徹底調査します。",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "最適製品を\nご提案",
                description:
                  "純正品・互換品・代替品など、予算や納期に合わせた複数の選択肢をご提示します。",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.765.7-1.402 1.292-2.048 1.914l-.31.285c-1.152 1.062-2.06 1.905-2.478 3.082-.19.537-.251 1.05-.306 1.543-.003.027-.005.054-.007.082-.025.36-.048.722-.114 1.087-.152.844-.507 1.56-1.13 2.145-.136.128-.27.244-.405.355-.226.186-.46.367-.638.613C4.53 15.99 4.08 17.217 4.08 18.502c0 .284.014.565.043.84.036.34.094.664.173.977.203.803.72 1.318 1.484 1.522.29.077.587.117.891.126.157.003.314.006.472.006h9.714c.158 0 .315-.003.472-.006.304-.009.6-.049.89-.125.765-.205 1.282-.72 1.484-1.522.08-.314.138-.638.173-.978.029-.275.043-.556.043-.84 0-1.284-.45-2.513-1.263-3.493-.178-.246-.412-.427-.638-.613-.135-.111-.27-.227-.405-.356-.623-.584-.978-1.3-1.13-2.144-.066-.365-.089-.727-.114-1.087-.002-.028-.004-.055-.007-.082-.055-.492-.116-1.006-.306-1.543-.419-1.177-1.326-2.02-2.478-3.082l-.31-.285c-.646-.622-1.283-1.215-2.048-1.914a1.148 1.148 0 0 0-1.606 0Z" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "手配から納品まで\n一貫対応",
                description:
                  "ご承認いただいた後は、発注・手配・納品までスムーズに代行。アフターフォローも万全です。",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {/* Step number badge */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-blue-900 text-white flex items-center justify-center relative z-10 shadow-lg">
                  {item.icon}
                </div>
                {/* Step label */}
                <p className="text-center text-sm font-bold text-blue-700 mb-2">
                  STEP {item.step}
                </p>
                <h3 className="text-center text-lg font-bold text-gray-900 mb-3 whitespace-pre-line leading-snug">
                  {item.title}
                </h3>
                <p className="text-center text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            あらゆるアイテムに対応
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16">
            製造業から建設・プラントまで、幅広い分野の産業資材・設備機器をカバー。
            お客様の「探しているけど見つからない」を解決します。
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "電気・電子部品",
                items: "制御機器・センサー・スイッチ・電源",
                href: "/inventory",
              },
              {
                label: "機械・駆動部品",
                items: "モーター・減速機・ベアリング・ポンプ",
                href: "/inventory",
              },
              {
                label: "空圧・油圧機器",
                items: "シリンダー・バルブ・フィルタ・ホース",
                href: "/inventory",
              },
              {
                label: "配管・バルブ",
                items: "各種バルブ・継手・フランジ・パッキン",
                href: "/inventory",
              },
              {
                label: "安全・保護具",
                items: "ヘルメット・保護メガネ・作業服・手袋",
                href: "/inventory",
              },
              {
                label: "測定・計測機器",
                items: "温度計・圧力計・流量計・各種メーター",
                href: "/inventory",
              },
              {
                label: "工具・作業用品",
                items: "電動工具・ハンドツール・溶接用品",
                href: "/inventory",
              },
              {
                label: "工場設備",
                items: "搬送機器・産業用ロボット・エアコン",
                href: "/inventory",
              },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group"
              >
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {cat.items}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 text-blue-900 font-semibold hover:text-blue-700 transition-colors"
            >
              もっと見る
              <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            サトー産業が選ばれる理由
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16">
              単なる製品販売ではなく、「探す」から「届ける」までを一貫して代行。
              お客様の負担を徹底的に削減します。
              <br />
              <span className="text-gray-400 text-sm">所在地：愛媛県松山市</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "圧倒的な\n取引ネットワーク",
                description:
                  "国内外250社以上の優良メーカーと直接取引。特殊品・廃番品もネットワークを駆使して調査可能です。",
                stat: "250+",
                statLabel: "提携メーカー",
                href: "/manufacturers",
              },
              {
                title: "代替品提案の\nプロフェッショナル",
                description:
                  "廃番・生産終了品でも、スペック・互換性を徹底分析し最適な代替品をご提案。純正品比30〜50%コストダウンも実現。",
                stat: "5,000+",
                statLabel: "代替提案実績",
                href: "/services",
              },
              {
                title: "スピード対応\n在庫即納体制",
                description:
                  "豊富な在庫を常時確保。在庫品は即日出荷も可能。お急ぎの依頼にもスピーディーに対応いたします。",
                stat: "10,000+",
                statLabel: "在庫アイテム数",
                href: "/inventory",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-200 group border border-gray-100 hover:border-blue-200"
              >
                {/* Stat highlight */}
                <div className="mb-6">
                  <span className="text-3xl font-bold text-blue-900">{item.stat}</span>
                  <span className="text-sm text-gray-400 ml-2">{item.statLabel}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors whitespace-pre-line leading-snug">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== USE CASE / FLOW VISUAL ===== */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            実際のご依頼例
          </h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16">
            このようなアイテムのご依頼をいただき、解決してきました。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Case 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">機械部品</span>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">廃番品</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">
                生産終了のモーター代替品を調査
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                <p className="text-gray-400 mb-1">依頼内容</p>
                <p className="text-gray-700">「10年前に購入したA社のモーターが故障。型番XX-500は廃番。代替品を探してほしい」</p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-green-700 mb-1">解決策</p>
                <p>スペックを分析し、互換性のあるB社の後継機種を提案。納期3日・コスト20%ダウンを実現。</p>
              </div>
            </div>

            {/* Case 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">安全用品</span>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">コスト削減</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">
                作業用手袋のコスト削減と品質維持
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                <p className="text-gray-400 mb-1">依頼内容</p>
                <p className="text-gray-700">「現在使っているC社の作業用手袋のコストを下げたい。ただし品質は維持したい」</p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-green-700 mb-1">解決策</p>
                <p>同等スペックのD社製品を提案。サンプルテストを経て採用決定。年間コスト35%削減に成功。</p>
              </div>
            </div>

            {/* Case 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">制御機器</span>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">緊急対応</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">
                ライン停止！至急センサーを手配
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                <p className="text-gray-400 mb-1">依頼内容</p>
                <p className="text-gray-700">「生産ラインのセンサーが故障。型番が読めない。製造ラインが止まっているので至急何とかしてほしい」</p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-green-700 mb-1">解決策</p>
                <p>写真から形状・端子を分析し該当品を特定。在庫品を即日特急便で手配し、ライン復旧まで12時間。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            まずはお気軽にご相談ください
          </h2>
          <p className="text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              アイテム1点からのご依頼も承ります。情報が少なくても構いません。
              経験豊富なスタッフが最適なソリューションをご提案いたします。
              <br />
              <span className="text-blue-300 text-base">愛媛県内のお客様からのお問い合わせを歓迎いたします。</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/inquiry"
              className="inline-block bg-white text-blue-900 px-10 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
            >
              アイテムを依頼する
            </Link>
            <Link
              href="/company"
              className="inline-block border-2 border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              会社概要を見る
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}