import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

// FEAT-1.4: Onboarding page
export default function OnboardingPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-2xl">
      <div className="flex flex-col items-center gap-lg w-full px-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">beeSvat 시작하기</h1>
          <p className="mt-sm text-sm text-text-secondary">성경 구문 분석 도우미를 소개합니다</p>
        </div>
        <OnboardingFlow />
      </div>
    </div>
  );
}
