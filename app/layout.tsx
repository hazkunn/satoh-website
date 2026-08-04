import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalChrome from "@/components/ConditionalChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "サトー産業 | 愛媛県四国中央市の産業資材・設備機器 総合商社",
  description:
    "愛媛県四国中央市のサトー産業は、産業資材・設備機器の総合商社です。型番不明・廃番品もお任せください。最適な製品マッチング、代替品提案、在庫確認までワンストップで対応。愛媛県内のお客様を迅速にサポートいたします。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConditionalChrome>
          <main className="flex-1">{children}</main>
        </ConditionalChrome>
      </body>
    </html>
  );
}