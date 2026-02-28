'use client';

// FEAT-1.5 + FEAT-5.2: Home page with TodayQT and verse input area
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createAnalysis } from '@/services/analysisService';
import Card from '@/components/ui/Card';
import VerseInputForm from '@/components/bible/VerseInputForm';
import type { VerseInitialData } from '@/components/bible/VerseInputForm';
import TodayQT from '@/components/bible/TodayQT';

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // "이 구절 분석하기" → 즉시 분석 API 호출 후 결과 페이지로 이동
  const handleAnalyze = async (data: VerseInitialData) => {
    setIsAnalyzing(true);
    try {
      const result = await createAnalysis(accessToken ?? null, {
        book: data.book,
        chapter: data.chapter,
        verseStart: data.verseStart,
        verseEnd: data.verseEnd,
        passageText: data.passageText,
      });
      router.push(`/analysis/${result.id}`);
    } catch {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-sm py-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">beeSvat</h1>
        <p className="text-xs text-text-secondary">
          성경 구절을 입력하면 구문 구조를 자동으로 분석합니다
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <TodayQT onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      </div>
      <Card className="w-full max-w-2xl">
        <h2 className="mb-xs text-base font-semibold text-text-primary">직접 입력</h2>
        <VerseInputForm />
      </Card>
    </div>
  );
}
