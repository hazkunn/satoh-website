import { NextRequest, NextResponse } from "next/server";

const AI_API_URL = process.env.AI_API_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";

// All pages on the website for the AI to suggest links
const WEBSITE_PAGES = [
  { path: "/", title: "ホーム" },
  { path: "/inventory", title: "在庫一覧" },
  { path: "/services", title: "サービス" },
  { path: "/manufacturers", title: "取扱メーカー" },
  { path: "/company", title: "会社概要" },
  { path: "/inquiry", title: "お問い合わせ" },
];

// Keywords that suggest the user is asking about a product
const PRODUCT_QUERY_KEYWORDS = [
  "在庫", "製品", "商品", "型番", "価格", "見積", "注文",
  "ベアリング", "ポンプ", "バルブ", "シリンダー", "フィルター",
  "モーター", "センサー", "スイッチ", "リレー", "工具",
  "油圧", "空圧", "切削", "計測", "電気", "機構部品",
  "nsuk", "nsk", "ntn", "iko", "thk", "ミスミ", "mitsubishi",
  "三菱", "オムロン", "キーエンス", "smc", "ckd", "koganei",
  "parker", "vickers", "yuken", "daikin", "nach i", "nachai",
  "6013", "6205", "6305", "6204", "6304", // common bearing sizes
];

// Check if the message looks like a product query
function isProductQuery(text: string): boolean {
  const lower = text.toLowerCase();
  // Check for model number patterns (alphanumeric with hyphens)
  if (/[a-z]\d{2,}/i.test(lower) || /\d{4,}/.test(lower)) return true;
  // Check for product keywords
  return PRODUCT_QUERY_KEYWORDS.some((kw) => lower.includes(kw));
}

// Extract search query from user message
function extractSearchQuery(text: string): string {
  // Remove common question phrases
  return text
    .replace(/[？?].*$/, "")
    .replace(/在庫は|ありますか|教えて|ください|お願い|見たい|探して/g, "")
    .replace(/^.*(?:について|の在庫|の製品|の商品|を探し)/g, "")
    .trim() || text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || "";

    // Build system prompt (lean - no product dump)
    let systemPrompt = `あなたは「サトー産業」のAIアシスタントです。愛媛県松山市の産業資材・設備機器の総合商社です。

あなたの役割:
1. お客様の質問に丁寧に日本語で回答する
2. お客様から製品名・型番・ブランド名の質問があった場合は、search_inventory() ツールを使って在庫を検索し、該当する製品ページへ案内する
3. 画像がアップロードされた場合は、画像に写っている製品を識別し、該当する製品情報を提供する
4. お客様を適切なページに案内する

【ウェブサイトのページ一覧】
${WEBSITE_PAGES.map((p) => `- ${p.title}: ${p.path}`).join("\n")}

回答ルール:
- 常に丁寧な日本語で答えてください
- 製品について質問された場合は、search_inventory() で検索して該当製品を特定し、在庫ページのリンクを提示してください
- 製品が見つからない場合は、お問い合わせページへの案内をしてください
- リンクを提示する場合は「こちら」という言葉を使って自然にリンクを埋め込んでください
- お客様が会話の中で特定の製品ページに移動したいと言った場合は、リダイレクト用の特別な応答として "REDIRECT_TO:" の後にURLを続けてください（例: "REDIRECT_TO:/inventory"）`;

    // If it looks like a product query, search and inject results
    let searchContext = "";
    if (isProductQuery(lastMessage)) {
      const searchQuery = extractSearchQuery(lastMessage);
      try {
        const searchRes = await fetch(
          `${request.nextUrl.origin}/api/ai/search`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: searchQuery }),
          }
        );
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          searchContext = `\n\n【検索結果】\n以下の製品が見つかりました:\n`;
          searchData.results.forEach((r: { name: string; url: string; snippet: string }) => {
            searchContext += `- ${r.name}\n  リンク: ${r.url}\n  詳細: ${r.snippet}\n`;
          });
          searchContext += `\n上記の製品が見つかりました。該当する製品のリンクをお客様に提示してください。`;
        } else {
          searchContext = `\n\n【検索結果】\n「${searchQuery}」に一致する製品は見つかりませんでした。お客様にはお問い合わせページへの案内をしてください。`;
        }
      } catch {
        searchContext = `\n\n【検索結果】\n検索中にエラーが発生しました。`;
      }
    }

    // Append search results to system prompt for this request only
    systemPrompt += searchContext;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // If no custom API is configured, return a simulated response for development
    if (!AI_API_URL) {
      const response = generateSimulatedResponse(lastMessage, searchContext);
      return NextResponse.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: response.text,
            },
          },
        ],
        redirectUrl: response.redirectUrl,
      });
    }

    // Call the custom API
    const apiResponse = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // Check if the response contains a redirect instruction
    const content = data.choices?.[0]?.message?.content || "";
    let redirectUrl: string | null = null;

    const redirectMatch = content.match(/REDIRECT_TO:(\/\S*)/);
    if (redirectMatch) {
      redirectUrl = redirectMatch[1];
      // Remove the redirect instruction from the response content
      data.choices[0].message.content = content
        .replace(/REDIRECT_TO:\/\S*/, "")
        .trim();
    }

    return NextResponse.json({
      ...data,
      redirectUrl,
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}

// Simulated response for development when no API is configured
function generateSimulatedResponse(
  message: string,
  searchContext: string
): {
  text: string;
  redirectUrl: string | null;
} {
  const msg = message.toLowerCase();

  // If search found results, use them
  if (searchContext.includes("見つかりました")) {
    const linkMatch = searchContext.match(/リンク: (\/\S+)/);
    const nameMatch = searchContext.match(/- (.+?)\n/);
    const link = linkMatch ? linkMatch[1] : "/inventory";
    const name = nameMatch ? nameMatch[1] : "製品";

    if (msg.includes("案内") || msg.includes("ページ") || msg.includes("リダイレクト") || msg.includes("見せ")) {
      return {
        text: `${name}のページにご案内します。`,
        redirectUrl: link,
      };
    }

    return {
      text: `「${name}」が見つかりました。詳細は[こちら](${link})をご覧ください。`,
      redirectUrl: null,
    };
  }

  // If search found nothing
  if (searchContext.includes("一致する製品は見つかりません")) {
    return {
      text: "申し訳ございません、該当する製品が見つかりませんでした。お手数ですが[お問い合わせ](/inquiry)ページよりご連絡いただけますと、弊社スタッフが詳しく調査いたします。",
      redirectUrl: null,
    };
  }

  // Default response
  return {
    text: "こんにちは！サトー産業のAIアシスタントです。油圧機器、空圧機器、切削工具など、産業資材・設備機器についてのお問い合わせをお受けしております。製品名や型番をお知らせいただければ、在庫を検索してご案内いたします。また、画像をアップロードしていただければ、製品の識別をお手伝いします。",
    redirectUrl: null,
  };
}