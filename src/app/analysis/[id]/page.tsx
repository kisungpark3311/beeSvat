'use client';

// FEAT-2 + T2.4: Analysis detail page with SSE streaming integration
import { useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { getAnalysis, rateAnalysis } from '@/services/analysisService';
import { useAnalysisStream } from '@/hooks/useAnalysisStream';
import AnalysisResult from '@/components/analysis/AnalysisResult';
import StarRatingFeedback from '@/components/analysis/StarRatingFeedback';
import StreamingLoader from '@/components/analysis/StreamingLoader';

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const accessToken = useAuthStore((s) => s.accessToken);
  const { currentAnalysis, isLoading, error, setCurrentAnalysis, setLoading, setError } =
    useAnalysisStore();

  const {
    status: streamStatus,
    progress,
    result: streamResult,
    error: streamError,
    startStream,
    reset: resetStream,
  } = useAnalysisStream();

  useEffect(() => {
    if (!accessToken || !id) return;

    setLoading(true);
    getAnalysis(accessToken, id)
      .then((data) => {
        setCurrentAnalysis(data);

        // If analysis is still pending, auto-start SSE streaming
        if (data.status === 'pending') {
          startStream(id, accessToken);
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      setCurrentAnalysis(null);
      resetStream();
    };
  }, [accessToken, id, setCurrentAnalysis, setLoading, setError, startStream, resetStream]);

  // When streaming completes, update the store with the result
  useEffect(() => {
    if (streamStatus === 'completed' && streamResult) {
      setCurrentAnalysis(streamResult);
    }
  }, [streamStatus, streamResult, setCurrentAnalysis]);

  // When streaming errors, update the store
  useEffect(() => {
    if (streamStatus === 'error' && streamError) {
      setError(streamError);
    }
  }, [streamStatus, streamError, setError]);

  const handleRate = useCallback(
    (rating: number) => {
      if (!accessToken || !id) return;
      rateAnalysis(accessToken, id, rating).then((res) => {
        if (currentAnalysis) {
          setCurrentAnalysis({ ...currentAnalysis, rating: res.rating });
        }
      });
    },
    [accessToken, id, currentAnalysis, setCurrentAnalysis],
  );

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

  if (error && streamStatus !== 'processing' && streamStatus !== 'connecting') {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Show streaming loader when analysis is being processed
  if (streamStatus === 'connecting' || streamStatus === 'processing') {
    return <StreamingLoader progress={progress} status={streamStatus} />;
  }

  // Show streaming loader if analysis is pending but stream hasn't started yet
  if (currentAnalysis?.status === 'pending' && streamStatus === 'idle') {
    return <StreamingLoader progress="분석 준비 중..." status="connecting" />;
  }

  if (!currentAnalysis) {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-text-secondary">분석 결과를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg py-lg">
      <AnalysisResult analysis={currentAnalysis} />
      <StarRatingFeedback
        analysisId={currentAnalysis.id}
        currentRating={currentAnalysis.rating}
        onRate={handleRate}
      />
    </div>
  );
}
