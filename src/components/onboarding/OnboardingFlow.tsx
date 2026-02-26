'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStep } from './OnboardingStep';
import { SampleAnalysis } from './SampleAnalysis';

const TOTAL_STEPS = 3;

// FEAT-1.4: 3-step onboarding flow component
export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push('/');
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center gap-xl w-full max-w-md">
      {/* Step indicator dots */}
      <div className="flex items-center gap-sm">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentStep ? 'w-6 bg-primary' : 'w-2 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="w-full min-h-[320px] flex items-start justify-center">
        {currentStep === 0 && (
          <OnboardingStep
            title="구문 분석이란?"
            description="성경 구문 분석은 성경 본문을 문법적으로 분석하여 주어, 동사, 목적어, 수식어 등의 관계를 파악하는 것입니다. 이를 통해 본문의 구조를 명확히 이해하고, 하나님의 말씀을 더 깊이 묵상할 수 있습니다."
          />
        )}
        {currentStep === 1 && (
          <OnboardingStep
            title="사용법 안내"
            description="성경 구절을 입력하면 AI가 자동으로 구문을 분석해 줍니다. 주요 동사는 파란색, 수식어는 초록색, 접속어는 노란색으로 표시되어 본문의 구조를 한눈에 파악할 수 있습니다. 분석 결과를 저장하고 나만의 구문 분석 노트를 만들어 보세요."
          />
        )}
        {currentStep === 2 && (
          <OnboardingStep
            title="샘플 분석 체험"
            description="아래는 실제 구문 분석 결과의 예시입니다. 색상별로 문장 성분이 어떻게 구분되는지 확인해 보세요."
          >
            <SampleAnalysis />
          </OnboardingStep>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col items-center gap-sm w-full">
        <button
          onClick={handleNext}
          className="h-12 w-full rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors"
        >
          {currentStep < TOTAL_STEPS - 1 ? '다음' : '시작하기'}
        </button>
        {currentStep < TOTAL_STEPS - 1 && (
          <button
            onClick={handleSkip}
            className="h-10 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
