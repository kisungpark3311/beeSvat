'use client';

// FEAT-1.5 + T2.4: Verse input form with API submission + auto-fetch
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createAnalysis } from '@/services/analysisService';
import { getPassage } from '@/services/bibleService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export interface VerseInitialData {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  passageText: string;
}

export default function VerseInputForm() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passageText, setPassageText] = useState('');

  // 본문 자동 조회
  const handleFetchPassage = useCallback(
    async (book: string, chapter: number, verseStart: number, verseEnd?: number) => {
      if (!book || !chapter || !verseStart) return;
      setIsFetching(true);
      setFormError(null);
      try {
        const result = await getPassage(book, chapter, verseStart, verseEnd);
        setPassageText(result.fullText);
      } catch {
        // 자동 조회 실패 시 수동 입력 안내 (에러 표시하지 않음)
        setPassageText('');
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  // 폼에서 값을 읽어 본문 조회
  const fetchFromForm = useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const book = (fd.get('book') as string)?.trim();
    const ch = parseInt(fd.get('chapter') as string, 10);
    const vs = parseInt(fd.get('verseStart') as string, 10);
    const veStr = fd.get('verseEnd') as string;
    const ve = veStr ? parseInt(veStr, 10) : undefined;

    if (book && ch > 0 && vs > 0) {
      handleFetchPassage(book, ch, vs, ve);
    }
  }, [handleFetchPassage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const book = (formData.get('book') as string)?.trim();
    const chapterStr = formData.get('chapter') as string;
    const verseStartStr = formData.get('verseStart') as string;
    const verseEndStr = formData.get('verseEnd') as string;
    const text = passageText.trim();

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
    if (!text) {
      setFormError('본문 텍스트를 입력해주세요. 위 장/절을 입력하면 자동 조회됩니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAnalysis(accessToken ?? null, {
        book,
        chapter,
        verseStart,
        verseEnd,
        passageText: text,
      });

      router.push(`/analysis/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '분석 요청에 실패했습니다. 다시 시도해주세요.';
      setFormError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} className="flex flex-col gap-sm" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Input
            label="성경 책명"
            placeholder="예: 요한복음"
            name="book"
            required
            onBlur={() => fetchFromForm()}
          />
        </div>
        <div>
          <Input
            label="장"
            placeholder="3"
            name="chapter"
            type="number"
            min={1}
            required
            onBlur={() => fetchFromForm()}
          />
        </div>
        <div>
          <Input
            label="시작 절"
            placeholder="16"
            name="verseStart"
            type="number"
            min={1}
            required
            onBlur={() => fetchFromForm()}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Input
            label="끝 절 (선택)"
            placeholder="18"
            name="verseEnd"
            type="number"
            min={1}
            onBlur={() => fetchFromForm()}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isFetching}
        onClick={() => fetchFromForm()}
      >
        {isFetching ? '본문 조회 중...' : '본문 조회'}
      </Button>
      <Textarea
        label="본문"
        placeholder={isFetching ? '본문 조회 중...' : '본문 조회 버튼 또는 직접 입력'}
        name="passageText"
        rows={1}
        value={passageText}
        onChange={(e) => setPassageText(e.target.value)}
      />
      {formError && (
        <p className="text-sm text-error" role="alert">
          {formError}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={isSubmitting || isFetching}
      >
        {isSubmitting ? '분석 요청 중...' : '구문 분석하기'}
      </Button>
    </form>
  );
}
