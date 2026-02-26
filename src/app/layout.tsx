import type { Metadata } from 'next';
import '@/styles/globals.css';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'beeSvat - 성경 구문 분석',
  description: '성경 본문의 구문 구조를 자동 분석하여 깊은 묵상을 돕는 AI 도우미',
  keywords: ['성경', '구문 분석', '묵상', '개혁신학', 'Bible', 'syntax analysis'],
  openGraph: {
    title: 'beeSvat - 성경 구문 분석',
    description: '성경 본문의 구문 구조를 자동 분석하여 깊은 묵상을 돕는 AI 도우미',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
