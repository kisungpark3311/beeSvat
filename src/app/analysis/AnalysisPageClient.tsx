'use client';

// FEAT-2: Analysis list page client component
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { listAnalyses, deleteAnalysis, retryAnalysis } from '@/services/analysisService';
import Card from '@/components/ui/Card';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    completed: { className: 'bg-green-100 text-green-700', label: '완료' },
    failed: { className: 'bg-red-100 text-red-700', label: '실패' },
  };
  const { className, label } = config[status] ?? {
    className: 'bg-yellow-100 text-yellow-700',
    label: '분석 중',
  };
  return <span className={`rounded-md px-sm py-xs text-xs font-medium ${className}`}>{label}</span>;
}

export default function AnalysisPageClient() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    analyses,
    isLoading,
    error,
    setAnalyses,
    removeAnalysis: removeFromStore,
    updateAnalysisStatus,
    setLoading,
    setError,
  } = useAnalysisStore();

  useEffect(() => {
    setLoading(true);
    listAnalyses(accessToken ?? null)
      .then((res) => {
        setAnalyses(res.items, res.meta);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken, setAnalyses, setLoading, setError]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm('이 분석을 삭제하시겠습니까?')) return;
      deleteAnalysis(accessToken ?? null, id)
        .then(() => removeFromStore(id))
        .catch((err: Error) => setError(err.message));
    },
    [accessToken, removeFromStore, setError],
  );

  const handleRetry = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      retryAnalysis(accessToken ?? null, id)
        .then(() => {
          updateAnalysisStatus(id, 'pending');
          router.push(`/analysis/${id}`);
        })
        .catch((err: Error) => setError(err.message));
    },
    [accessToken, updateAnalysisStatus, setError, router],
  );

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
                  <StatusBadge status={item.status} />
                  {item.rating !== null && (
                    <span className="text-xs text-accent">{item.rating}/5</span>
                  )}
                  {item.status !== 'completed' && (
                    <>
                      <button
                        onClick={(e) => handleRetry(e, item.id)}
                        className="rounded-md px-sm py-xs text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        title="재분석"
                      >
                        재분석
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="rounded-md px-sm py-xs text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </>
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
