'use client';

import type { MeditationListItem } from '@contracts/meditation.contract';
import type { PaginationMeta } from '@contracts/types';
import MeditationCard from '@/components/meditation/MeditationCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// FEAT-3: Meditation list component with pagination

interface MeditationListProps {
  meditations: MeditationListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function MeditationList({
  meditations,
  meta,
  isLoading,
  onPageChange,
}: MeditationListProps) {
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

  if (meditations.length === 0) {
    return (
      <Card className="py-xl text-center">
        <p className="text-text-secondary">
          묵상 노트가 없습니다. 성경 구문 분석 후 묵상을 시작해보세요.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-sm">
        {meditations.map((meditation) => (
          <MeditationCard key={meditation.id} meditation={meditation} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-md">
          <Button
            variant="secondary"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-text-secondary">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
