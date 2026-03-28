import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 U.M.A web 専用：SEO最強メタデータ設定
export const metadata: Metadata = {
  title: 'Jazz Phrase Generator | 2-5-1-6 ジャズギター・リック生成',
  description: '伝説のジャズギタリスト25人のスタイルをシミュレート。2-5-1-6進行のリックを自動生成し、五線譜とタブ譜で表示します。ジャズギターの練習やアドリブのアイディアに。',
  keywords: ['ジャズギター', '2-5-1', 'リック生成', 'アドリブ練習', 'ギタリスト', 'ジャズフレーズ', 'UMA web'],
  authors: [{ name: 'buro', url: 'https://note.com/jazzy_begin' }],
  openGraph: {
    title: 'Jazz Phrase Generator | 2-5-1-6 ジャズギター・リック生成',
    description: 'プロのボイスリーディングを再現したジャズフレーズ生成ツール',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'U.M.A web',
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}