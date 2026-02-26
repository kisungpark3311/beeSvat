'use client';

// FEAT-2: Analysis list page client component
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { listAnalyses } from '@/services/analysisService';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function AnalysisPageClient() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { analyses, isLoading, error, setAnalyses, setLoading, setError } = useAnalysisStore();

  useEffect(() => {
    if (!accessToken) return;

    setLoading(true);
    listAnalyses(accessToken)
      .then((res) => {
        setAnalyses(res.data, res.meta);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken, setAnalyses, setLoading, setError]);

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-text-secondary">로그인이 필요합니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
          aria-label="loading"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg py-lg">
      <h1 className="text-2xl font-bold text-text-primary">구문 분석 목록</h1>

      {analyses.length === 0 ? (
        <Card className="text-center py-xl">
          <p className="text-text-secondary">아직 분석 결과가 없습니다</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-md">
          {analyses.map((item) => (
            <Link key={item.id} href={`/analysis/${item.id}`}>
              <Card hoverable className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">
                    {item.book} {item.chapter}:{item.verseStart}
                    {item.verseEnd > item.verseStart ? `-${item.verseEnd}` : ''}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <span
                    className={[
                      'rounded-md px-sm py-xs text-xs font-medium',
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700',
                    ].join(' ')}
                  >
                    {item.status === 'completed' ? '완료' : '분석 중'}
                  </span>
                  {item.rating !== null && (
                    <span className="text-xs text-accent">{item.rating}/5</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
