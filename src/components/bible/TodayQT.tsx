'use client';

// FEAT-5.2: Today's QT component (fetches and displays daily Bible passage)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTodayQT } from '@/services/bibleService';
import type { TodayQTResponse } from '@/services/bibleService';
import type { BibleVerse } from './BibleViewer';
import BibleViewer from './BibleViewer';
import Button from '@/components/ui/Button';
import type { VerseInitialData } from './VerseInputForm';

interface TodayQTProps {
  onAnalyze?: (data: VerseInitialData) => void;
  isAnalyzing?: boolean;
}

export default function TodayQT({ onAnalyze, isAnalyzing }: TodayQTProps) {
  const [qtData, setQtData] = useState<TodayQTResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchQT() {
      setLoading(true);
      setError(null);

      const data = await getTodayQT();
      if (cancelled) return;

      if (!data) {
        setError('오늘의 QT를 불러올 수 없습니다. 성경 구절을 직접 입력해주세요.');
        setLoading(false);
        return;
      }

      setQtData(data);
      setLoading(false);
    }

    fetchQT().catch(() => {
      if (!cancelled) {
        setError('오늘의 QT를 불러올 수 없습니다. 성경 구절을 직접 입력해주세요.');
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-lg">
        <div className="flex animate-pulse flex-col gap-md">
          <div className="h-6 w-1/3 rounded bg-border" />
          <div className="h-4 w-1/4 rounded bg-border" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-border" />
            <div className="h-4 w-5/6 rounded bg-border" />
            <div className="h-4 w-4/6 rounded bg-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface p-lg">
        <p className="text-sm text-text-secondary">{error}</p>
        <Link href="/" className="mt-sm inline-block text-sm text-primary hover:underline">
          성경 구절 직접 입력하기
        </Link>
      </div>
    );
  }

  if (!qtData) return null;

  const verses: BibleVerse[] = [
    {
      book: qtData.book,
      chapter: qtData.chapter,
      verse: qtData.verseStart,
      text: qtData.fullText,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface p-sm">
      <div className="mb-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{qtData.title}</h2>
          <p className="text-xs text-text-secondary">
            {qtData.book} {qtData.chapter}:{qtData.verseStart}
            <span className="ml-2">{qtData.date}</span>
          </p>
        </div>
      </div>

      <BibleViewer verses={verses} book={qtData.book} chapter={qtData.chapter} />

      <div className="mt-xs">
        <Button
          variant="secondary"
          size="sm"
          disabled={isAnalyzing}
          onClick={() => {
            onAnalyze?.({
              book: qtData.book,
              chapter: qtData.chapter,
              verseStart: qtData.verseStart,
              verseEnd: qtData.verseEnd,
              passageText: qtData.fullText,
            });
          }}
        >
          {isAnalyzing ? '분석 요청 중...' : '이 구절 분석하기'}
        </Button>
      </div>
    </div>
  );
}
