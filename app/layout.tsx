import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocialIcon from "@/components/FloatingSocialIcon";
import AiWidget from "@/components/AiWidget/AiWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "サトー産業 | 愛媛県松山市の産業資材・設備機器 総合商社",
  description:
    "愛媛県松山市のサトー産業は、産業資材・設備機器の総合商社です。型番不明・廃番品もお任せください。最適な製品マッチング、代替品提案、在庫確認までワンストップで対応。愛媛県内のお客様を迅速にサポートいたします。",
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
        <FloatingSocialIcon />
        <AiWidget />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}