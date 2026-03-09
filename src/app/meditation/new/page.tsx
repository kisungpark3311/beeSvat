'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createMeditation, generateMeditation } from '@/services/meditationService';
import MeditationEditor from '@/components/meditation/MeditationEditor';
import { useState } from 'react';

// FEAT-3: New meditation page

export default function NewMeditationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysisId = searchParams.get('analysisId') ?? undefined;

  const handleSave = async (content: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const meditation = await createMeditation(accessToken ?? null, { analysisId, content });
      router.push(`/meditation/${meditation.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '묵상 노트 저장에 실패했습니다';
      setError(
        message.includes('401') || message.includes('AUTH')
          ? '묵상 노트 저장은 로그인이 필요합니다'
          : message,
      );
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleGenerate = async (aiAnalysisId: string): Promise<string> => {
    if (!accessToken) throw new Error('AI 묵상 생성은 로그인이 필요합니다');
    const result = await generateMeditation(accessToken, aiAnalysisId);
    return result.content;
  };

  return (
    <div className="flex flex-col gap-lg py-lg">
      <h1 className="text-2xl font-bold text-text-primary">새 묵상 작성</h1>
      {error && (
        <div
          className="rounded-md bg-red-50 border border-red-200 p-md text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}
      <MeditationEditor
        analysisId={analysisId}
        onSave={handleSave}
        onCancel={handleCancel}
        onGenerate={analysisId ? handleGenerate : undefined}
        isSaving={isSaving}
      />
    </div>
  );
}
