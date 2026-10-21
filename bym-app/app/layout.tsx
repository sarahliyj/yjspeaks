import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_ORIGIN ?? 'https://bym.eagerrice32.chatgpt.site',
  ),
  title: '笔姆 — 写下值得慢慢读的事',
  description: '一个安静的中文写作与阅读空间。关注你选择的作者，读到尽头，然后回到生活。',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: '笔姆 — 写下值得慢慢读的事',
    description: '一个安静的中文写作与阅读空间。关注你选择的作者，读到尽头，然后回到生活。',
    siteName: '笔姆',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '笔姆 — 写下值得慢慢读的事' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '笔姆 — 写下值得慢慢读的事',
    description: '一个安静的中文写作与阅读空间。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
