'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useMeditationStore } from '@/stores/meditationStore';
import { listMeditations } from '@/services/meditationService';
import MeditationList from '@/components/meditation/MeditationList';
import Button from '@/components/ui/Button';

// FEAT-3: Meditation list page client component

export default function MeditationPageClient() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { meditations, meta, isLoading, error, setMeditations, setLoading, setError } =
    useMeditationStore();

  const fetchMeditations = useCallback(
    (page = 1) => {
      setLoading(true);
      listMeditations(accessToken ?? null, page)
        .then((res) => {
          setMeditations(res.data, res.meta);
        })
        .catch((err: Error) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [accessToken, setMeditations, setLoading, setError],
  );

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  if (error) {
    return (
      <div className="flex items-center justify-center py-xl">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg py-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">묵상 노트</h1>
        <Link href="/meditation/new">
          <Button>새 묵상 작성</Button>
        </Link>
      </div>

      <MeditationList
        meditations={meditations}
        meta={meta}
        isLoading={isLoading}
        onPageChange={fetchMeditations}
      />
    </div>
  );
}
