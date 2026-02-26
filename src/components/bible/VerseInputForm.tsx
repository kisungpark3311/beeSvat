'use client';

// FEAT-1.5 + T2.4: Verse input form with API submission
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createAnalysis } from '@/services/analysisService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function VerseInputForm() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!accessToken) {
      setFormError('로그인이 필요합니다');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const book = (formData.get('book') as string)?.trim();
    const chapterStr = formData.get('chapter') as string;
    const verseStartStr = formData.get('verseStart') as string;
    const verseEndStr = formData.get('verseEnd') as string;
    const passageText = (formData.get('passageText') as string)?.trim();

    // Basic validation
    if (!book) {
      setFormError('성경 책명을 입력해주세요');
      return;
    }

    const chapter = parseInt(chapterStr, 10);
    const verseStart = parseInt(verseStartStr, 10);
    const verseEnd = verseEndStr ? parseInt(verseEndStr, 10) : verseStart;

    if (!chapter || chapter < 1) {
      setFormError('장을 올바르게 입력해주세요');
      return;
    }
    if (!verseStart || verseStart < 1) {
      setFormError('시작 절을 올바르게 입력해주세요');
      return;
    }
    if (verseEnd < verseStart) {
      setFormError('끝 절은 시작 절보다 크거나 같아야 합니다');
      return;
    }
    if (!passageText) {
      setFormError('본문 텍스트를 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    const result = await createAnalysis(accessToken, {
      book,
      chapter,
      verseStart,
      verseEnd,
      passageText,
    });

    router.push(`/analysis/${result.id}`);
  };

  return (
    <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Input label="성경 책명" placeholder="예: 요한복음" name="book" required />
        </div>
        <div>
          <Input label="장" placeholder="3" name="chapter" type="number" min={1} required />
        </div>
        <div>
          <Input
            label="시작 절"
            placeholder="16"
            name="verseStart"
            type="number"
            min={1}
            required
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Input
            label="끝 절"
            placeholder="18"
            name="verseEnd"
            type="number"
            min={1}
            helperText="선택 사항"
          />
        </div>
      </div>
      <Textarea
        label="본문 직접 입력"
        placeholder="분석할 성경 본문을 직접 입력해주세요..."
        name="passageText"
        rows={4}
        helperText="분석할 성경 본문을 입력해주세요"
        required
      />
      {formError && (
        <p className="text-sm text-error" role="alert">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-sm w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? '분석 요청 중...' : '구문 분석하기'}
      </Button>
    </form>
  );
}
