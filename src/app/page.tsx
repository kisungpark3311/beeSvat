'use client';

// FEAT-1.5 + FEAT-5.2: Home page with TodayQT and verse input area
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { createAnalysis } from '@/services/analysisService';
import Card from '@/components/ui/Card';
import VerseInputForm from '@/components/bible/VerseInputForm';
import type { VerseInitialData } from '@/components/bible/VerseInputForm';
import TodayQT from '@/components/bible/TodayQT';

export default function Home() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <h1 className="text-2xl font-bold text-primary">BeeSvat</h1>
        <p className="text-xs text-text-secondary">
          성경 구절을 입력하면 구문 구조를 자동으로 분석합니다
        </p>
      </div>
      {mounted && !isAuthenticated && (
        <div className="w-full max-w-2xl rounded-lg border border-primary/30 bg-primary/5 px-md py-sm flex items-center justify-between gap-md">
          <p className="text-sm text-text-secondary">
            로그인하면 분석 기록과 묵상 노트를 저장할 수 있습니다.
          </p>
          <div className="flex shrink-0 gap-sm">
            <Link
              href="/login"
              className="rounded-md bg-primary px-md py-xs text-sm text-white hover:bg-primary-hover transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-primary px-md py-xs text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      )}
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
