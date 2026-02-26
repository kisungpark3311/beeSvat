'use client';

// T2.4: Streaming progress loader with skeleton UI

interface StreamingLoaderProps {
  progress: string;
  status: 'connecting' | 'processing';
}

export default function StreamingLoader({ progress, status: _status }: StreamingLoaderProps) {
  return (
    <div className="flex flex-col items-center gap-lg py-xl">
      {/* Spinner */}
      <div className="relative">
        <span
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
          aria-label="processing"
        />
      </div>

      {/* Progress text */}
      <p className="text-text-secondary animate-pulse">{progress}</p>

      {/* Skeleton UI */}
      <div className="w-full max-w-2xl space-y-md">
        <div className="rounded-lg border border-border bg-surface p-lg">
          <div className="space-y-sm">
            <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
            <div className="h-4 w-full animate-pulse rounded bg-border" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-border" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-lg">
          <div className="space-y-sm">
            <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
            <div className="h-3 w-full animate-pulse rounded bg-border" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
