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
  description: '伝説のジャズギタリスト25人のスタイルをシミュレート。2-5-1-6進行のリックを自動生成し、五線譜とタブ譜で表示します。',
  keywords: ['ジャズギター', '2-5-1', 'リック生成', 'アドリブ練習', 'ギタリスト', 'ジャズフレーズ', 'UMA web'],
  authors: [{ name: 'buro', url: 'https://note.com/jazzy_begin' }],
  
  // 👇 ここからOpen Graphの設定を強化
  openGraph: {
    title: 'Jazz Phrase Generator | 2-5-1-6 ジャズギター・リック生成',
    description: '伝説のギタリストのスタイルでジャズフレーズを自動生成。練習やアドリブのアイディアに。',
    url: 'https://jazz-phrase.vercel.app', // 自分のサイトURL
    siteName: 'U.M.A web',
    images: [
      {
        url: 'https://jazz-phrase.vercel.app/ogp-image.png', // 👇 ここで画像の絶対URLを指定！
        width: 1200,
        height: 630,
        alt: 'Jazz Phrase Generator アプリ画面イメージ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  
  // 👇 X (旧Twitter) 専用の設定も追加しておくと、より綺麗に表示される
  twitter: {
    card: 'summary_large_image', // 大型画像付きのカード形式
    title: 'Jazz Phrase Generator | ジャズギター・リック生成',
    description: '2-5-1-6進行のリックを自動生成。五線譜＆タブ譜対応。',
    images: ['https://jazz-phrase.vercel.app/ogp-image.png'], // 画像の絶対URL
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