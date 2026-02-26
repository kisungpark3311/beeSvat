'use client';

// FEAT-2: Verb detail side panel showing grammar analysis and references
import { useEffect, useState, useCallback } from 'react';
import type { VerbDetailResponse } from '@contracts/verb.contract';
import { getVerbDetail } from '@/services/verbService';
import { useAuthStore } from '@/stores/authStore';
import GrammarTable from '@/components/analysis/GrammarTable';
import ReferenceVerses from '@/components/analysis/ReferenceVerses';

interface VerbDetailPanelProps {
  verb: {
    word: string;
    original: string;
    meaning: string;
    analysisResultId: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function VerbDetailPanel({ verb, isOpen, onClose }: VerbDetailPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [detail, setDetail] = useState<VerbDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    setIsLoading(true);
    setError(null);
    setDetail(null);

    getVerbDetail(accessToken, verb.original, verb.analysisResultId)
      .then((res) => {
        setDetail(res);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, accessToken, verb.original, verb.analysisResultId]);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const languageBadge =
    detail?.language === 'hebrew' ? '\uD788\uBE0C\uB9AC\uC5B4' : '\uD5EC\uB77C\uC5B4';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${verb.word} \uB3D9\uC0AC \uC0C1\uC138`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-[400px] flex-col border-l border-border bg-background shadow-lg animate-in slide-in-from-right duration-300 overflow-y-auto"
        onClick={handlePanelClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-md">
          <h2 className="text-sm font-semibold text-text-secondary">
            {'\uC6D0\uC5B4 \uB3D9\uC0AC \uC0C1\uC138'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-xs text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            aria-label="close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-lg p-md">
          {isLoading && (
            <div className="flex flex-col items-center gap-md py-xl">
              <span
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
                role="status"
                aria-label="loading"
              />
              <p className="text-sm text-text-secondary">{'\uBD88\uB7EC\uC624\uB294 \uC911...'}</p>
            </div>
          )}

          {error && <p className="text-sm text-red-500 py-md">{error}</p>}

          {detail && (
            <>
              {/* Original word display */}
              <div className="flex flex-col items-center gap-sm py-md">
                <span
                  className="text-[28px] font-serif leading-tight text-text-primary"
                  dir={detail.language === 'hebrew' ? 'rtl' : 'ltr'}
                >
                  {detail.originalWord}
                </span>
                <span className="text-sm text-text-secondary">{detail.transliteration}</span>
                <div className="flex items-center gap-sm">
                  <span className="rounded-full bg-syntax-verb-bg px-sm py-xs text-xs font-medium text-syntax-verb">
                    {languageBadge}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {'\uC5B4\uADFC'}: {detail.rootForm}
                  </span>
                </div>
              </div>

              {/* Meaning */}
              <div className="rounded-md bg-surface p-md">
                <h3 className="mb-xs text-xs font-semibold text-text-secondary">
                  {'\uC758\uBBF8'}
                </h3>
                <p className="text-sm text-text-primary">{detail.meaning}</p>
              </div>

              {/* Grammar table */}
              <div>
                <h3 className="mb-sm text-xs font-semibold text-text-secondary">
                  {'\uBB38\uBC95 \uBD84\uC11D'}
                </h3>
                <GrammarTable grammar={detail.grammar} language={detail.language} />
              </div>

              {/* Reference verses */}
              {accessToken && (
                <ReferenceVerses word={detail.originalWord} accessToken={accessToken} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
