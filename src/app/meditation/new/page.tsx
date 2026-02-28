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

  const analysisId = searchParams.get('analysisId') ?? undefined;

  const handleSave = async (content: string) => {
    setIsSaving(true);
    const meditation = await createMeditation(accessToken ?? null, { analysisId, content });
    router.push(`/meditation/${meditation.id}`);
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
