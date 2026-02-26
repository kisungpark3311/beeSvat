'use client';

// FEAT-2: Star rating feedback component for analysis
import { useState } from 'react';
import StarRating from '@/components/ui/StarRating';

interface StarRatingFeedbackProps {
  analysisId: string;
  currentRating: number | null;
  onRate: (rating: number) => void;
}

export default function StarRatingFeedback({
  analysisId: _analysisId,
  currentRating,
  onRate,
}: StarRatingFeedbackProps) {
  const [rated, setRated] = useState(currentRating !== null);
  const [value, setValue] = useState(currentRating ?? 0);

  const handleRate = (rating: number) => {
    setValue(rating);
    setRated(true);
    onRate(rating);
  };

  return (
    <div className="flex flex-col items-center gap-sm py-md">
      <p className="text-sm font-medium text-text-secondary">
        {rated ? '평가해주셔서 감사합니다' : '이 분석 결과는 어떠셨나요?'}
      </p>
      <StarRating value={value} onChange={handleRate} readonly={false} size={28} />
    </div>
  );
}
