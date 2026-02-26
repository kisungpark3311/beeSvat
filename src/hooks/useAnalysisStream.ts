'use client';

import { useState, useCallback, useRef } from 'react';
import type { AnalysisDetail } from '@contracts/analysis.contract';

// T2.4: SSE streaming hook for real-time analysis progress

interface StreamState {
  status: 'idle' | 'connecting' | 'processing' | 'completed' | 'error';
  progress: string;
  result: AnalysisDetail | null;
  error: string | null;
}

export function useAnalysisStream() {
  const [state, setState] = useState<StreamState>({
    status: 'idle',
    progress: '',
    result: null,
    error: null,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback((analysisId: string, accessToken: string) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState({ status: 'connecting', progress: '연결 중...', result: null, error: null });

    const url = `/api/v1/analysis/${analysisId}/stream?token=${encodeURIComponent(accessToken)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('status', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { message: string };
      setState((prev) => ({ ...prev, status: 'processing', progress: data.message }));
    });

    es.addEventListener('result', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as AnalysisDetail;
      setState({ status: 'completed', progress: '분석 완료', result: data, error: null });
      es.close();
    });

    es.addEventListener('error', (event: MessageEvent) => {
      const data = event.data
        ? (JSON.parse(event.data) as { message: string })
        : { message: '분석 중 오류가 발생했습니다' };
      setState((prev) => ({ ...prev, status: 'error', error: data.message }));
      es.close();
    });

    es.onerror = () => {
      setState((prev) => ({ ...prev, status: 'error', error: '연결이 끊어졌습니다' }));
      es.close();
    };
  }, []);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState({ status: 'idle', progress: '', result: null, error: null });
  }, []);

  return { ...state, startStream, reset };
}
