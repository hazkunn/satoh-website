import { NextRequest, NextResponse } from "next/server";
import type { SearchResult } from "./search/route";

const AI_API_URL = process.env.AI_API_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "deepseek/deepseek-v4-pro-cheaper:thinking";

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
  // Japanese
  "在庫", "製品", "商品", "型番", "価格", "見積", "注文",
  "ベアリング", "ポンプ", "バルブ", "シリンダー", "フィルター",
  "モーター", "センサー", "スイッチ", "リレー", "工具",
  "油圧", "空圧", "切削", "計測", "電気", "機構部品",
  // English
  "bearing", "pump", "valve", "cylinder", "filter", "motor",
  "sensor", "switch", "relay", "tool", "hose", "pipe", "seal",
  "gear", "compressor", "blower", "fan", "cooler", "heater",
  "actuator", "controller", "inverter", "regulator", "gauge",
  // Brands (Japanese)
  "ミスミ", "三菱", "オムロン", "キーエンス",
  // Brands (English)
  "mitsubishi", "omron", "keyence", "smc", "ckd", "koganei",
  "parker", "vickers", "yuken", "daikin", "nachi", "nsk", "ntn",
  "iko", "thk", "nsuk", "tsurumi", "ebara", "goulds", "grundfos",
  "ksb", "sulzer", "flowserve", "itt", "kirloskar", "hitachi",
  "toyota", "kawasaki", "komatsu", "kubota", "yanmar", "sumitomo",
];

// Check if the message looks like a product query
function isProductQuery(text: string): boolean {
  const lower = text.toLowerCase();
  // Check for model number patterns (e.g., 80B2.4, 6013, TL-200, P-100A, 3HP)
  if (/[a-z0-9][\-.][a-z0-9]/i.test(lower)) return true; // e.g., 80B2.4, TL-200
  if (/\d+[a-z]/i.test(lower)) return true; // e.g., 80B2, 3HP
  if (/[a-z]+\d/i.test(lower)) return true; // e.g., TSURUMI 80B2.4
  if (/\d{3,}/.test(lower)) return true; // e.g., 6013, 100
  // Check for product keywords
  return PRODUCT_QUERY_KEYWORDS.some((kw) => lower.includes(kw));
}

// Extract search query from user message — returns multiple queries to try
function extractSearchQueries(text: string): string[] {
  const lower = text.toLowerCase().trim();
  const queries: string[] = [lower];

  // Remove common Japanese question phrases for a cleaner query
  const cleaned = text
    .replace(/[？?].*$/, "")
    .replace(/在庫は|ありますか|教えて|ください|お願い|見たい|探して/g, "")
    .replace(/^.*(?:について|の在庫|の製品|の商品|を探し)/g, "")
    .trim();
  if (cleaned && cleaned !== lower) queries.unshift(cleaned.toLowerCase().trim());

  // Try to extract just the model number (e.g., 80B2.4 from "tsurumi pump 80B2.4")
  const modelMatch = text.match(/([a-z0-9]+[\-.][a-z0-9]+)/i);
  if (modelMatch) {
    queries.unshift(modelMatch[1].toLowerCase());
  }

  // Also try alphanumeric sequences that look like model numbers (no punctuation)
  const alphaNumMatch = text.match(/(\d+[a-z]+)/i);
  if (alphaNumMatch && !modelMatch) {
    queries.unshift(alphaNumMatch[1].toLowerCase());
  }

  return [...new Set(queries)]; // deduplicate
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
1. お客様の質問に丁寧に日本語で回答する。質問内容が事業と無関係であっても無視したり拒否したりせず、まずは親切に回答してください。
2. ただし、会話の主題を自然に「サトー産業」の事業（産業資材・設備機器・在庫・サービス・会社情報など）へ誘導することがあなたの仕事です。回答の最後に、事業に関連する提案や質問を添えて、会話をビジネスの話題へ繋げてください。
3. お客様から製品名・型番・ブランド名の質問があった場合は、search_inventory() ツールを使って在庫を検索し、該当する製品ページへ案内する
4. 画像がアップロードされた場合は、画像に写っている製品を識別し、該当する製品情報を提供する
5. お客様を適切なページに案内する

【ウェブサイトのページ一覧】
${WEBSITE_PAGES.map((p) => `- ${p.title}: ${p.path}`).join("\n")}

回答ルール:
- 常に丁寧な日本語で答えてください
- 事業と無関係な質問でも断らずに回答し、そのあとで自然に事業の話題へ誘導してください
- 製品について質問された場合は、search_inventory() で検索して該当製品を特定し、在庫ページのリンクを提示してください
- 製品が見つからない場合は、お問い合わせページへの案内をしてください
- リンクを提示する場合は「こちら」という言葉を使って自然にリンクを埋め込んでください
- お客様が会話の中で特定の製品ページに移動したいと言った場合は、リダイレクト用の特別な応答として "REDIRECT_TO:" の後にURLを続けてください（例: "REDIRECT_TO:/inventory")

【プロアクティブなお問い合わせ案内】
あなたは会話の中で積極的にお問い合わせを提案する役割があります。

【発動タイミング】
- 製品が検索結果で見つかった場合：製品情報を提示した後、「この製品についてお問い合わせいたしますか？」と提案してください。
- 製品が見つからなかった場合：お問い合わせページへの案内を提案してください。
- お客様が見積もりや詳細情報を求めた場合：お問い合わせを提案してください。

【お問い合わせに必要な情報】
お問い合わせフォームに自動入力するために必要な情報は以下の通りです：
- 必須：メールアドレスまたは電話番号（どちらか一方のみでOK）
- 任意：会社名、お名前（なくてもOK）
- AIが自動入力：お問い合わせ項目（subject）とお問い合わせ内容（message）は会話の文脈から自動的に決定します

【お問い合わせの進め方】
1. 製品が特定できたら、お客様に「この製品についてお問い合わせいたしますか？」と提案する。
2. お客様が希望したら、「ご連絡先としてメールアドレスまたは電話番号を教えてください」と尋ねる。
3. お客様からメールアドレスまたは電話番号のいずれか一方をいただいたら、すぐにINQUIRY_FILLリンクを生成する。両方なくてもOK。名前も不要。
4. subject（お問い合わせ項目）は会話の文脈から自動的に選択：製品について, 在庫について, お見積もりについて, サービスについて, その他
5. message（お問い合わせ内容）は会話の内容から適切な概要を自動生成する。
6. 自動入力リンクの形式：
   INQUIRY_FILL:/inquiry?company=会社名&name=お名前&email=メール&phone=電話&subject=件名&message=内容
7. パラメータ値はURLエンコード（encodeURIComponent）してください。空のパラメータは省略可能です。
8. リンクを応答の最後に一行で含めてください。システムが自動的にリンクを検出し、お客様をお問い合わせページに案内します。
9. 例：お客様が「電話は03-1234-5678です」とだけ言った場合：
   INQUIRY_FILL:/inquiry?phone=03-1234-5678&subject=%E8%A3%BD%E5%93%81%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6&message=%E8%A3%BD%E5%93%81%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%AE%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B

【ハルシネーション防止ルール】
- 製品名・型番・仕様・価格・在庫状況など、事実に基づく情報は検索結果またはウェブサイトのページ一覧のみを根拠にしてください。根拠のない情報をでっち上げないでください。
- 一般知識や雑談については、常識の範囲内で回答して構いませんが、サトー産業の事業に関する事実は捏造しないでください。`;

    // If it looks like a product query, search inventory with multiple query attempts
    let searchContext = "";
    let noResultsFound = false;
    if (isProductQuery(lastMessage)) {
      const searchQueries = extractSearchQueries(lastMessage);
      let allResults: SearchResult[] = [];

      for (const searchQuery of searchQueries) {
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
            for (const r of searchData.results) {
              // Only add if not already in results
              if (!allResults.some((existing: SearchResult) => existing.slug === r.slug)) {
                allResults.push(r);
              }
            }
          }
        } catch {
          // Continue to next query attempt
        }
      }

      if (allResults.length > 0) {
        searchContext = `\n\n[SEARCH RESULTS] The following products were found in our inventory:\n`;
        allResults.forEach((r: { name: string; url: string; snippet: string }) => {
          searchContext += `- ${r.name}\n  URL: ${r.url}\n  Detail: ${r.snippet}\n`;
        });
        searchContext += `\nIMPORTANT: Only list products from the search results above. Do NOT mention any products not listed here. Direct the customer to the appropriate product page.`;
      } else {
        noResultsFound = true;
      }
    } else {
      // Not a product query — answer freely but keep anti-hallucination guardrail for business facts
      systemPrompt += `\n\nIMPORTANT GUARDRAIL: You have NOT searched the inventory for this query. Do NOT claim to have any specific product information. If the user asks about a specific product or model number, tell them you need to look it up and suggest they ask with a product name or model number. Do NOT invent model numbers, specifications, or product details. Only reference the website pages listed above. However, you may still answer general/non-business questions naturally and conversationally, then gently steer the conversation toward our business.`;
    }

    // If no results found in inventory, let the AI handle it naturally instead of a canned response
    if (noResultsFound) {
      systemPrompt += `\n\n[SEARCH RESULTS] No matching products were found in our inventory for this query.\nIMPORTANT: Do NOT invent or list any products. Tell the customer politely that the item is not currently listed on the website, and suggest they contact us via the inquiry page ([お問い合わせ](/inquiry)) so our staff can look into it. You may still answer any non-product part of the user's question naturally, then guide them toward the inquiry page.`;
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
      body: JSON.stringify({
        model: AI_MODEL,
        messages: apiMessages,
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // Check if the response contains a redirect instruction
    const content = data.choices?.[0]?.message?.content || "";
    let redirectUrl: string | null = null;

    // Check for INQUIRY_FILL first (pre-filled inquiry form)
    const inquiryMatch = content.match(/INQUIRY_FILL:(\/[^\s]*)/);
    if (inquiryMatch) {
      redirectUrl = inquiryMatch[1];
      // Remove the INQUIRY_FILL instruction from the response content
      data.choices[0].message.content = content
        .replace(/INQUIRY_FILL:\/[^\s]*\s*/, "")
        .trim();
    } else {
      // Check for REDIRECT_TO
      const redirectMatch = content.match(/REDIRECT_TO:(\/\S*)/);
      if (redirectMatch) {
        redirectUrl = redirectMatch[1];
        // Remove the redirect instruction from the response content
        data.choices[0].message.content = content
          .replace(/REDIRECT_TO:\/\S*/, "")
          .trim();
      }
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
  if (searchContext) {
    const urlMatch = searchContext.match(/URL: (\/\S+)/);
    const nameMatch = searchContext.match(/- (.+?)\n/);
    const link = urlMatch ? urlMatch[1] : "/inventory";
    const name = nameMatch ? nameMatch[1] : "製品";

    if (msg.includes("案内") || msg.includes("ページ") || msg.includes("リダイレクト") || msg.includes("見せ")) {
      return {
        text: `${name}のページにご案内します。`,
        redirectUrl: link,
      };
    }

    return {
      text: `「${name}」が見つかりました。詳細は[こちら](${link})をご覧ください。\n\nこの製品についてお問い合わせいたしますか？ご連絡先（メールアドレスまたは電話番号）を教えていただければ、お問い合わせフォームにご案内いたします。`,
      redirectUrl: null,
    };
  }

  // Check if the user is trying to fill an inquiry/contact form
  const inquiryKeywords = [
    "問い合わせ", "問合せ", "連絡", "相談", "依頼", "見積もり",
    "inquiry", "contact", "相談したい", "問い合わせたい",
  ];
  if (inquiryKeywords.some((kw) => msg.includes(kw))) {
    // Generate a pre-filled inquiry link from message context
    const companyMatch = message.match(/(?:会社|企業|法人)[:\s]*[「『]*(\S+?)[」』]*(?:です|ます|。|$)/);
    const nameMatch = message.match(/(?:名前|氏名)[:\s]*[「『]*(\S+?)[」』]*(?:です|ます|。|$)/);
    const emailMatch = message.match(/(?:メール|email|mail)[:\s]*[「『]*(\S+@\S+?)[」』]*(?:です|ます|。|$)/);
    const phoneMatch = message.match(/(?:電話|TEL|tel|携帯)[:\s]*[「『]*([\d\-]+)[」』]*(?:です|ます|。|$)/i);

    // Fallback: try less structured patterns
    const simpleNameMatch = message.match(/(\S{2,4})\s*(?:です|と申します|といいます)/);
    const simpleEmailMatch = message.match(/(\S+@\S+\.\S+)/);
    const simplePhoneMatch = message.match(/(\d{2,4}[\-]\d{2,4}[\-]\d{2,4})/);

    const company = companyMatch ? companyMatch[1] : "";
    const name = nameMatch ? nameMatch[1] : (simpleNameMatch ? simpleNameMatch[1] : "");
    const emailVal = emailMatch ? emailMatch[1] : (simpleEmailMatch ? simpleEmailMatch[1] : "");
    const phoneVal = phoneMatch ? phoneMatch[1] : (simplePhoneMatch ? simplePhoneMatch[1] : "");

    // Build query string - omit empty params
    const parts: string[] = [];
    if (company) parts.push(`company=${encodeURIComponent(company)}`);
    if (name) parts.push(`name=${encodeURIComponent(name)}`);
    if (emailVal) parts.push(`email=${encodeURIComponent(emailVal)}`);
    if (phoneVal) parts.push(`phone=${encodeURIComponent(phoneVal)}`);
    parts.push(`subject=${encodeURIComponent("その他")}`);
    parts.push(`message=${encodeURIComponent(message.slice(0, 200))}`);

    const inquiryUrl = `/inquiry?${parts.join("&")}`;
    return {
      text: `お問い合わせありがとうございます。内容を確認の上、お問い合わせフォームにご案内します。`,
      redirectUrl: inquiryUrl,
    };
  }

  // Default response — answer naturally, then steer toward business
  return {
    text: `${message}についてですね。お答えいたします。\n\nところで、サトー産業では油圧機器、空圧機器、切削工具など、産業資材・設備機器を幅広く取り扱っております。製品名や型番をお知らせいただければ、在庫を検索してご案内いたします。また、画像をアップロードしていただければ、製品の識別もお手伝いします。何かお探しのものはございますか？`,
    redirectUrl: null,
  };
}
