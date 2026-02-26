'use client';

// FEAT-2: Reference verses list for verb detail panel
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { VerbReferencesResponse } from '@contracts/verb.contract';
import { getVerbReferences } from '@/services/verbService';

interface ReferenceVersesProps {
  word: string;
  accessToken: string;
}

export default function ReferenceVerses({ word, accessToken }: ReferenceVersesProps) {
  const [data, setData] = useState<VerbReferencesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getVerbReferences(accessToken, word)
      .then((res) => {
        setData(res);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken, word]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-md">
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="loading"
        />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 py-sm">{error}</p>;
  }

  if (!data || data.references.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-sm">
        {'\uCC38\uC870 \uAD6C\uC808\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      <h4 className="text-sm font-semibold text-text-secondary">
        {'\uCC38\uC870 \uAD6C\uC808'} ({data.meta.total})
      </h4>
      <ul className="flex flex-col gap-xs">
        {data.references.map((ref) => (
          <li key={ref.analysisId}>
            <Link
              href={`/analysis/${ref.analysisId}`}
              className="block rounded-md border border-border bg-surface p-sm transition-colors hover:bg-background"
            >
              <span className="text-sm font-medium text-primary">
                {ref.book} {ref.chapter}:{ref.verse}
              </span>
              <p className="mt-xs text-xs text-text-secondary line-clamp-2">{ref.passageText}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
