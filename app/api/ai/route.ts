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
  "ベルト", "Vベルト", "伝達",
  // English
  "bearing", "pump", "valve", "cylinder", "filter", "motor",
  "sensor", "switch", "relay", "tool", "hose", "pipe", "seal",
  "gear", "compressor", "blower", "fan", "cooler", "heater",
  "actuator", "controller", "inverter", "regulator", "gauge",
  // Brands (Japanese)
  "ミスミ", "三菱", "オムロン", "キーエンス",
  // Brands (English)
  "mitsubishi", "omron", "keyence", "smc", "ckd", "koganei",
  "mitsuboshi", "三ツ星", "三ツ星ベルト",
  "parker", "vickers", "yuken", "daikin", "nachi", "nsk", "ntn",
  "iko", "thk", "nsuk", "tsurumi", "ebara", "goulds", "grundfos",
  "ksb", "sulzer", "flowserve", "itt", "kirloskar", "hitachi",
  "toyota", "kawasaki", "komatsu", "kubota", "yanmar", "sumitomo",
];

// Check if the message looks like a product query
function isProductQuery(text: string): boolean {
  const lower = text.toLowerCase();
  if (/[a-z0-9][\-.][a-z0-9]/i.test(lower)) return true;
  if (/\d+[a-z]/i.test(lower)) return true;
  if (/[a-z]+\d/i.test(lower)) return true;
  if (/\d{3,}/.test(lower)) return true;
  return PRODUCT_QUERY_KEYWORDS.some((kw) => lower.includes(kw));
}

// Extract search query from user message — returns multiple queries to try
function extractSearchQueries(text: string): string[] {
  const lower = text.toLowerCase().trim();
  const queries: string[] = [lower];

  const cleaned = text
    .replace(/[？?].*$/, "")
    .replace(/在庫は|ありますか|教えて|ください|お願い|見たい|探して/g, "")
    .replace(/^.*(?:について|の在庫|の製品|の商品|を探し)/g, "")
    .trim();
  if (cleaned && cleaned !== lower) queries.unshift(cleaned.toLowerCase().trim());

  const modelMatch = text.match(/([a-z0-9]+[\-.][a-z0-9]+)/i);
  if (modelMatch) {
    queries.unshift(modelMatch[1].toLowerCase());
  }

  const alphaNumMatch = text.match(/(\d+[a-z]+)/i);
  if (alphaNumMatch && !modelMatch) {
    queries.unshift(alphaNumMatch[1].toLowerCase());
  }

  return [...new Set(queries)];
}

// ── Contact-info detection & inquiry URL builder ──────────────────
// These run SERVER-SIDE so the inquiry form can be filled even when the
// AI model doesn't emit the INQUIRY_FILL: protocol (or when the upstream
// API is down). We scan the full conversation for an email or phone
// number — either one is enough to pre-fill the form.

type InquiryData = {
  company: string;
  name: string;
  email: string;
  phone: string;
};

type FlatMessage = { role: string; content: string };

function detectInquiryData(messages: FlatMessage[]): InquiryData | null {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join("\n");

  if (!userText.trim()) return null;

  const emailMatch = userText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = userText.match(/(\d{2,4}[-\s]\d{2,4}[-\s]\d{2,4}|\d{10,11})/);

  // Need at least an email OR a phone number to fill the form
  if (!emailMatch && !phoneMatch) return null;

  const companyMatch = userText.match(/(?:会社|企業|法人|会社名)[:\s]*[「『]*([^\s「『」』,，。]+)[」』]?/);
  const nameMatch = userText.match(/(?:名前|氏名|お名前)[:\s]*[「『]*([^\s「『」』,，。]+)[」』]?/);
  const simpleNameMatch = userText.match(/([^\s]{2,8})\s*(?:です|と申します|といいます)/);

  return {
    company: companyMatch ? companyMatch[1] : "",
    name: nameMatch ? nameMatch[1] : simpleNameMatch ? simpleNameMatch[1] : "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[1].replace(/\s/g, "-") : "",
  };
}

function guessSubject(messages: FlatMessage[]): string {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join(" ")
    .toLowerCase();

  if (userText.includes("見積") || userText.includes("価格") || userText.includes("料金")) {
    return "お見積もりについて";
  }
  if (userText.includes("在庫") || userText.includes("ありますか") || userText.includes("あるか")) {
    return "在庫について";
  }
  if (userText.includes("サービス") || userText.includes("修理") || userText.includes("保守")) {
    return "サービスについて";
  }
  if (
    userText.includes("製品") ||
    userText.includes("商品") ||
    userText.includes("型番") ||
    userText.includes("ベアリング") ||
    userText.includes("ポンプ")
  ) {
    return "製品について";
  }
  return "その他";
}

function buildInquiryUrl(data: InquiryData, messages: FlatMessage[]): string {
  const parts: string[] = [];
  if (data.company) parts.push(`company=${encodeURIComponent(data.company)}`);
  if (data.name) parts.push(`name=${encodeURIComponent(data.name)}`);
  if (data.email) parts.push(`email=${encodeURIComponent(data.email)}`);
  if (data.phone) parts.push(`phone=${encodeURIComponent(data.phone)}`);
  parts.push(`subject=${encodeURIComponent(guessSubject(messages))}`);

  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join(" / ");
  const messageSummary = userText.slice(0, 300);
  parts.push(`message=${encodeURIComponent(messageSummary)}`);

  return `/inquiry?${parts.join("&")}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "messages array is required" },
      { status: 400 }
    );
  }

  const lastMessage = messages[messages.length - 1]?.content || "";

  // Flatten messages to {role, content} strings for inquiry detection
  const flatMessages: FlatMessage[] = messages.map(
    (m: { role: string; content: unknown }) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : "",
    })
  );

  // ── Server-side inquiry detection ───────────────────────────────
  // Scan the conversation for contact info. If found, we can auto-fill
  // the inquiry form regardless of what the AI model does.
  const inquiryData = detectInquiryData(flatMessages);
  const inquiryUrl = inquiryData ? buildInquiryUrl(inquiryData, flatMessages) : null;

  try {
    // Build system prompt (lean - no product dump)
    let systemPrompt = `あなたは「サトー産業」のAIアシスタントです。愛媛県四国中央市の産業資材・設備機器の総合商社です。

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
- 製品が見つからない場合は、お客様にご連絡先（メールアドレスまたは電話番号）をお伺いしてください。ご連絡先をいただいてから、INQUIRY_FILLリンクでお問い合わせページにご案内してください。ご連絡先がない状態でお問い合わせページにリダイレクト（REDIRECT_TO:/inquiry）しないでください。
- リンクを提示する場合は「こちら」という言葉を使って自然にリンクを埋め込んでください
- お客様が会話の中で特定の製品ページに移動したいと言った場合は、リダイレクト用の特別な応答として "REDIRECT_TO:" の後にURLを続けてください（例: "REDIRECT_TO:/inventory"）

【プロアクティブなお問い合わせ案内】
あなたは会話の中で積極的にお問い合わせを提案する役割があります。

【発動タイミング】
- 製品が検索結果で見つかった場合：製品情報を提示した後、「ご注文やお見積もりをご希望の方は、ご連絡先（メールアドレスまたは電話番号）をお知らせください。お問い合わせフォームにご案内いたします。」と案内してください。「お問い合わせいたしますか？」のような確認の質問は一切しないでください。
- 製品が見つからなかった場合：お客様にご連絡先（メールアドレスまたは電話番号）をお伺いしてください。ご連絡先をいただいてからINQUIRY_FILLリンクでお問い合わせページにご案内してください。ご連絡先がない状態でREDIRECT_TO:/inquiryやINQUIRY_FILLリンクを出力しないでください。
- お客様が見積もりや詳細情報を求めた場合：すぐにご連絡先（メールアドレスまたは電話番号）をお知らせいただくようお伝えし、ご連絡先をいただいてからINQUIRY_FILLリンクを生成してください。

【お問い合わせに必要な情報】
お問い合わせフォームに自動入力するために必要な情報は以下の通りです：
- 必須：メールアドレスまたは電話番号（どちらか一方のみでOK）
- 任意：会社名、お名前（なくてもOK）
- AIが自動入力：お問い合わせ項目（subject）とお問い合わせ内容（message）は会話の文脈から自動的に決定します

【お問い合わせの進め方】
1. 製品が特定できたら、確認の質問（「お問い合わせしますか？」など）はせず、直接「ご注文やお見積もりをご希望の方は、ご連絡先（メールアドレスまたは電話番号）をお知らせください」と案内する。
2. お客様からメールアドレスまたは電話番号のいずれか一方をいただいたら、すぐにINQUIRY_FILLリンクを生成する。両方なくてもOK。名前も不要。
3. subject（お問い合わせ項目）は会話の文脈から自動的に選択：製品について, 在庫について, お見積もりについて, サービスについて, その他
4. message（お問い合わせ内容）は会話の内容から適切な概要を自動生成する。
5. 自動入力リンクの形式：
   INQUIRY_FILL:/inquiry?company=会社名&name=お名前&email=メール&phone=電話&subject=件名&message=内容
6. パラメータ値はURLエンコード（encodeURIComponent）してください。空のパラメータは省略可能です。
7. リンクを応答の最後に一行で含めてください。システムが自動的にリンクを検出し、お客様をお問い合わせページに案内します。
8. 例：お客様が「電話は03-1234-5678です」とだけ言った場合：
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
      systemPrompt += `\n\nIMPORTANT GUARDRAIL: You have NOT searched the inventory for this query. Do NOT claim to have any specific product information. If the user asks about a specific product or model number, tell them you need to look it up and suggest they ask with a product name or model number. Do NOT invent model numbers, specifications, or product details. Only reference the website pages listed above. However, you may still answer general/non-business questions naturally and conversationally, then gently steer the conversation toward our business.`;
    }

    if (noResultsFound) {
      systemPrompt += `\n\n[SEARCH RESULTS] No matching products were found in our inventory for this query.\nIMPORTANT: Do NOT invent or list any products. Tell the customer politely that the item is not currently listed on the website. Then ask the customer for their contact information (email address or phone number) so you can guide them to the inquiry form via INQUIRY_FILL. Do NOT output REDIRECT_TO:/inquiry or INQUIRY_FILL links until the customer has provided contact info. You may still answer any non-product part of the user's question naturally.`;
    }

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
      const response = generateSimulatedResponse(
        lastMessage,
        searchContext,
        inquiryUrl
      );
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

    // Some models (e.g. reasoning/thinking models) put their answer in
    // `reasoning_content` and leave `content` empty. Fall back to it.
    const rawMessage = data.choices?.[0]?.message || {};
    const content =
      (rawMessage.content && String(rawMessage.content).trim()) ||
      (rawMessage.reasoning_content && String(rawMessage.reasoning_content).trim()) ||
      "";

    let redirectUrl: string | null = null;

    // Check for INQUIRY_FILL first (AI model followed the protocol)
    const inquiryMatch = content.match(/INQUIRY_FILL:(\/[^\s]*)/);
    if (inquiryMatch) {
      // Only honor INQUIRY_FILL when we have contact info server-side.
      // Otherwise strip it and let the chat continue so the AI can
      // ask for the customer's contact details first.
      if (inquiryUrl) {
        redirectUrl = inquiryMatch[1];
        data.choices[0].message.content = content
          .replace(/INQUIRY_FILL:\/[^\s]*\s*/, "")
          .trim();
      } else {
        data.choices[0].message.content = content
          .replace(/INQUIRY_FILL:\/[^\s]*\s*/, "")
          .trim();
      }
    } else {
      // Check for REDIRECT_TO
      const redirectMatch = content.match(/REDIRECT_TO:(\/\S*)/);
      if (redirectMatch) {
        const target = redirectMatch[1];
        // Block redirects to the inquiry page when there's no contact info.
        if (target.startsWith("/inquiry") && !inquiryUrl) {
          redirectUrl = null;
          data.choices[0].message.content = content
            .replace(/REDIRECT_TO:\/\S*/, "")
            .trim();
        } else {
          redirectUrl = target;
          data.choices[0].message.content = content
            .replace(/REDIRECT_TO:\/\S*/, "")
            .trim();
        }
      } else if (content) {
        data.choices[0].message.content = content;
      }
    }

    // ── Fallback: if the AI didn't produce INQUIRY_FILL but we detected
    // contact info server-side, use our own inquiry URL. This makes the
    // form-filling work even when the model ignores the protocol.
    if (!redirectUrl && inquiryUrl) {
      redirectUrl = inquiryUrl;
    }

    return NextResponse.json({
      ...data,
      redirectUrl,
    });
  } catch (error) {
    console.error("AI API error:", error);

    // ── Graceful fallback: even if the AI API is down, if we detected
    // contact info from the conversation, still redirect to the inquiry
    // form. Otherwise return a friendly error message.
    if (inquiryUrl) {
      return NextResponse.json({
        choices: [
          {
            message: {
              role: "assistant",
              content:
                "お問い合わせありがとうございます。お問い合わせフォームにご案内いたします。",
            },
          },
        ],
        redirectUrl: inquiryUrl,
      });
    }

    return NextResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content:
              "申し訳ございません。現在AI応答サービスに接続できません。お手数ですが、しばらく経ってからもう一度お試しいただくか、直接お問い合わせページからご連絡ください。",
          },
        },
      ],
      redirectUrl: null,
    });
  }
}

// Simulated response for development when no API is configured
function generateSimulatedResponse(
  message: string,
  searchContext: string,
  serverInquiryUrl: string | null
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

    if (
      msg.includes("案内") ||
      msg.includes("ページ") ||
      msg.includes("リダイレクト") ||
      msg.includes("見せ")
    ) {
      return {
        text: `${name}のページにご案内します。`,
        redirectUrl: link,
      };
    }

    return {
      text: `「${name}」が見つかりました。詳細は[こちら](${link})をご覧ください。\n\nご注文やお見積もりをご希望の方は、ご連絡先（メールアドレスまたは電話番号）をお知らせください。お問い合わせフォームにご案内いたします。`,
      redirectUrl: null,
    };
  }

  // Check if the user is trying to fill an inquiry/contact form
  const inquiryKeywords = [
    "問い合わせ", "問合せ", "連絡", "相談", "依頼", "見積もり",
    "inquiry", "contact", "相談したい", "問い合わせたい",
  ];
  if (inquiryKeywords.some((kw) => msg.includes(kw))) {
    if (serverInquiryUrl) {
      return {
        text: `お問い合わせありがとうございます。内容を確認の上、お問い合わせフォームにご案内します。`,
        redirectUrl: serverInquiryUrl,
      };
    }
    return {
      text: `お問い合わせありがとうございます。お問い合わせフォームにご案内します。ご連絡先（メールアドレスまたは電話番号）をお知らせいただければ、フォームに自動入力いたします。`,
      redirectUrl: null,
    };
  }

  // Server-side contact detection (no inquiry keyword but contact info present)
  if (serverInquiryUrl) {
    return {
      text: `ご連絡先を確認いたしました。お問い合わせフォームにご案内いたします。`,
      redirectUrl: serverInquiryUrl,
    };
  }

  // Default response — answer naturally, then steer toward business
  return {
    text: `${message}についてですね。お答えいたします。\n\nところで、サトー産業では三ツ星（Mitsuboshi）Vベルトをはじめ、産業資材・設備機器を取り扱っております。製品名や型番をお知らせいただければ、在庫を検索してご案内いたします。また、画像をアップロードしていただければ、製品の識別もお手伝いします。何かお探しのものはございますか？`,
    redirectUrl: null,
  };
}