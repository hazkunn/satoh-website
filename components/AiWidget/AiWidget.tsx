"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 image data
};

const SESSION_KEY = "satoh-ai-messages";
const MAX_IMAGE_MB = 5;
const MAX_IMAGES_PER_CONVO = 3;
const MAX_MESSAGES = 50;
const MAX_CHARS_TOTAL = 50000;

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only restore text messages (images are ephemeral)
      return parsed.filter((m: Message) => !m.image);
    }
  } catch {}
  return [];
}

export default function AiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadMessages();
    if (saved.length > 0) return saved;
    return [
      {
        role: "assistant",
        content:
          "こんにちは！サトー産業のAIアシスタントです。油圧機器、空圧機器、切削工具など、産業資材・設備機器についてのお問い合わせをお受けしております。お気軽にご質問ください。また、画像をアップロードしていただければ、製品の識別をお手伝いします。",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Persist text-only to sessionStorage. On quota error, trim to 20 most recent.
  useEffect(() => {
    scrollToBottom();
    try {
      const textOnly = messages.map(({ role, content }) => ({ role, content }));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(textOnly));
    } catch (e) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        const trimmed = messages.slice(-20).map(({ role, content }) => ({ role, content }));
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(trimmed)); } catch {}
      }
    }
  }, [messages, scrollToBottom]);

  const canAddMessage = useCallback((): boolean => {
    if (messages.length >= MAX_MESSAGES) {
      setError("会話の上限に達しました。ページをリロードして新しい会話を開始してください。");
      return false;
    }
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalChars >= MAX_CHARS_TOTAL) {
      setError("会話が長すぎます。ページをリロードして新しい会話を開始してください。");
      return false;
    }
    return true;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!canAddMessage()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      ...(selectedImage ? { image: selectedImage } : {}),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);
    setError(null);

    try {
      // Only send last 30 messages to prevent context overflow
      const apiMessages = messages
        .concat(userMessage)
        .slice(-30)
        .map((m) => ({
          role: m.role,
          content: m.image
            ? [
                { type: "text", text: m.content || "この画像について教えてください" },
                { type: "image_url", image_url: { url: m.image } },
              ]
            : m.content,
        }));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (data.redirectUrl) {
        // If AI wants to redirect, close chat and navigate
        setIsOpen(false);
        router.push(data.redirectUrl);
        return;
      }

      const assistantContent =
        data.choices?.[0]?.message?.content ||
        "申し訳ございません。応答の生成中にエラーが発生しました。";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "申し訳ございません。通信エラーが発生しました。もう一度お試しください。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`画像ファイルサイズは${MAX_IMAGE_MB}MB以下にしてください`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const imageCount = messages.filter((m) => m.image).length;
    if (imageCount >= MAX_IMAGES_PER_CONVO) {
      setError("画像は3枚までしか送信できません");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
    };
    reader.onerror = () => {
      setError("画像の読み込みに失敗しました");
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Render message content with clickable links
  const renderMessageContent = (content: string) => {
    // Replace markdown links [text](url) with clickable anchor tags
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-0 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-l-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
          aria-label="AIチャットを開く"
          title="AIに質問する"
        >
          {/* AI icon */}
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {/* Ribbon / label */}
          <span className="text-sm font-bold whitespace-nowrap tracking-wide">
            AIに質問
          </span>
        </button>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-0 z-50 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-white rounded-l-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="font-bold text-sm">AI アシスタント</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white cursor-pointer"
              aria-label="閉じる"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-md border border-gray-100"
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2">
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        className="max-w-full h-auto rounded-lg max-h-32 object-cover"
                      />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {typeof renderMessageContent(msg.content) === "string"
                      ? msg.content
                      : renderMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {selectedImage && (
            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="h-10 w-10 object-cover rounded"
                />
                <button
                  onClick={removeSelectedImage}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer"
                >
                  ×
                </button>
              </div>
              <span className="text-xs text-gray-500">画像が選択されました</span>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  style={{ minHeight: "36px", maxHeight: "120px" }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 bottom-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                  aria-label="画像を添付"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl px-3 py-2 transition-colors cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}